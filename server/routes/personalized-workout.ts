import type { Request, Response } from "express";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, workoutPlans, clientGoals, progressMetrics } from "../../shared/schema";

interface ClientDetails {
  id?: string;
  fitnessLevel: string;
  goals: string[];
  restrictions: string[];
  preferences: string[];
  history?: any[];
}

interface WorkoutParameters {
  type: string;
  duration: number;
  focusAreas: string[];
  equipment: string[];
  intensityLevel: number;
  includeWarmup: boolean;
  includeCooldown: boolean;
}

interface AdaptiveSettings {
  personalizedFeedback?: boolean;
  progressionRate?: string;
  difficultyAdjustment?: string;
  alternativeExercises?: boolean;
}

export async function generatePersonalizedWorkout(req: Request, res: Response) {
  if (!req.user) return res.sendStatus(401);

  try {
    const {
      clientDetails,
      workoutParameters,
      adaptiveSettings,
      clientId,
      sessionType,
      fitnessLevel,
      focusAreas,
      preferredEquipment,
      avoidedExercises,
      pastWorkoutInfluence,
      intensityLevel,
      workoutDuration,
      includeWarmup,
      includeCooldown,
      notes,
      clientContext,
    } = req.body;

    // Fetch client data if a clientId was provided but no context was passed
    let clientData = clientContext;
    if (clientId && !clientData) {
      // Fetch client information
      const client = await db.query.users.findFirst({
        where: eq(users.id, parseInt(clientId)),
      });

      // Fetch client workout history
      const workoutHistory = await db.query.workoutPlans.findMany({
        where: eq(workoutPlans.clientId, parseInt(clientId)),
        orderBy: (workoutPlans, { desc }) => [desc(workoutPlans.createdAt)],
        limit: 5, // Get the 5 most recent workouts
      });

      // Fetch client goals
      const goals = await db.query.clientGoals.findMany({
        where: eq(clientGoals.clientId, parseInt(clientId)),
      });

      // Fetch client metrics
      const metrics = await db.query.progressMetrics.findMany({
        where: eq(progressMetrics.clientId, parseInt(clientId)),
        orderBy: (progressMetrics, { desc }) => [desc(progressMetrics.date)],
        limit: 10, // Get the 10 most recent metrics
      });

      clientData = {
        client,
        history: workoutHistory,
        goals,
        metrics,
      };
    }

    // Create the prompt for the AI
    const promptParts = [
      `Create a personalized workout plan with the following specifications:

Session Type: ${sessionType === "personal" ? "Personal Training" : "Group Class"}
Fitness Level: ${fitnessLevel}
Duration: ${workoutDuration} minutes
Intensity Level: ${intensityLevel}/10
Focus Areas: ${focusAreas?.join(", ") || "General fitness"}`,
    ];

    if (preferredEquipment && preferredEquipment.length > 0) {
      promptParts.push(`Preferred Equipment: ${preferredEquipment.join(", ")}`);
    }

    if (avoidedExercises && avoidedExercises.length > 0) {
      promptParts.push(`Exercises to Avoid: ${avoidedExercises.join(", ")}`);
    }

    if (notes) {
      promptParts.push(`Additional Notes: ${notes}`);
    }

    // Add client context if available
    if (clientData) {
      promptParts.push("\nClient Context:");

      if (clientData.client) {
        promptParts.push(`Name: ${clientData.client.name || "Unknown"}`);
        promptParts.push(`Age: ${clientData.client.age || "Unknown"}`);
        promptParts.push(`Gender: ${clientData.client.gender || "Unknown"}`);
      }

      if (clientData.goals && clientData.goals.length > 0) {
        promptParts.push("\nClient Goals:");
        clientData.goals.forEach((goal: any) => {
          promptParts.push(`- ${goal.description}`);
        });
      }

      if (clientData.history && clientData.history.length > 0) {
        promptParts.push("\nRecent Workout History:");
        clientData.history.forEach((workout: any, index: number) => {
          promptParts.push(`${index + 1}. ${workout.title || "Workout"} (${new Date(workout.createdAt).toLocaleDateString()})`);
          if (workout.content && workout.content.exercises) {
            const exercises = workout.content.exercises.map((ex: any) => ex.name).join(", ");
            promptParts.push(`   Exercises: ${exercises}`);
          }
        });
      }

      if (clientData.metrics && clientData.metrics.length > 0) {
        promptParts.push("\nRecent Metrics:");
        clientData.metrics.forEach((metric: any) => {
          promptParts.push(`- ${metric.name}: ${metric.value} ${metric.unit} (${new Date(metric.date).toLocaleDateString()})`);
        });
      }
    }

    promptParts.push(`
Previous Workout Impact: ${pastWorkoutInfluence || 50}% (how much previous workouts should influence this one)

RESPONSE FORMAT:
Return your response as a JSON object with the following structure:
{
  "introduction": {
    "overview": "Brief overview of the workout plan",
    "fitnessLevel": "Identified fitness level",
    "focusAreas": ["Primary focus area", "Secondary focus area"]
  },
  "sessionDetails": {
    "name": "Descriptive name for the workout",
    "type": "Personal or Group",
    "duration": "Total minutes",
    "intensity": "1-10 scale",
    "equipment": ["List of equipment needed"]
  },
  "warmup": {
    "duration": "Minutes",
    "exercises": [
      {
        "name": "Exercise name",
        "description": "Brief description",
        "duration": "Time or reps",
        "notes": "Any special instructions"
      }
    ]
  },
  "mainWorkout": {
    "circuits": [
      {
        "name": "Circuit name",
        "rounds": "Number of rounds",
        "restBetweenExercises": "Rest time",
        "restBetweenRounds": "Rest time",
        "exercises": [
          {
            "name": "Exercise name",
            "targetMuscles": ["Muscle groups"],
            "sets": "Number of sets",
            "reps": "Reps per set or time",
            "rest": "Rest period",
            "intensity": "1-10 or percentage",
            "description": "How to perform",
            "modifications": {
              "easier": "Easier version",
              "harder": "More challenging version"
            },
            "alternatives": ["Alternative exercises"]
          }
        ]
      }
    ]
  },
  "cooldown": {
    "duration": "Minutes",
    "exercises": [
      {
        "name": "Exercise name",
        "description": "Brief description",
        "duration": "Time or reps"
      }
    ]
  },
  "progressionPlan": {
    "nextSteps": "Suggestions for progression",
    "adaptations": "Potential modifications for future sessions"
  },
  "notes": "Any additional notes or instructions"
}`);

    // Combine all prompt parts
    const fullPrompt = promptParts.join("\n");

    // Try with Anthropic's Claude first
    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        temperature: 0.7,
        system: "You are an expert personal trainer and coach specializing in creating personalized workout plans. Create detailed, evidence-based workout plans tailored to the client's needs, goals, and constraints.",
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
      });

      // Extract and parse the JSON content from the response
      const content = response.content[0].text;
      try {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                           content.match(/```\n([\s\S]*?)\n```/) || 
                           content.match(/{[\s\S]*}/);

        if (!jsonMatch) {
          throw new Error("No valid JSON found in the response");
        }

        const plan = JSON.parse(jsonMatch[1] || jsonMatch[0]);

        // Save to database if clientId was provided
        if (clientId) {
          await db.insert(workoutPlans).values({
            trainerId: req.user.id,
            clientId: parseInt(clientId),
            workspaceId: req.user.workspaceId || 1,
            title: `${plan.sessionDetails.name || "Personalized Workout"}`,
            description: plan.introduction.overview || "",
            content: plan,
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
            status: "active",
          });
        }

        res.json({ success: true, plan });
      } catch (error) {
        console.error("Failed to parse Claude AI response:", error);
        // Fallback to OpenAI
        throw new Error("Failed to parse Claude response");
      }
    } catch (claudeError) {
      console.error("Claude API error, falling back to OpenAI:", claudeError);

      // Fallback to OpenAI
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert personal trainer and coach specializing in creating personalized workout plans. Create detailed, evidence-based workout plans tailored to the client's needs, goals, and constraints.",
            },
            {
              role: "user",
              content: fullPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        });

        // Parse the JSON from OpenAI
        const plan = JSON.parse(response.choices[0].message.content || "{}");
        return res.json({ plan });
      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError);
        throw new Error("Failed to generate workout plan with both AI services");
      }
    }
  } catch (error: any) {
    console.error("Personalized workout generation error:", error);
    return res.status(500).json({
      error: "Failed to generate personalized workout",
      details: error.message,
    });
  }
}