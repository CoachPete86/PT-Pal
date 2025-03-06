
import { Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { documents, users, progressMetrics, clientGoals, workoutPlans } from "@shared/schema";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable is not set");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generatePersonalizedWorkout(req: Request, res: Response) {
  if (!req.user) return res.sendStatus(401);

  try {
    const {
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
Focus Areas: ${focusAreas.join(", ")}`,
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
      promptParts.push(`
Client Context:
${clientData.client ? `Name: ${clientData.client.fullName}` : ""}
${clientData.client && clientData.client.preferences?.age ? `Age: ${clientData.client.preferences.age}` : ""}
${clientData.client && clientData.client.preferences?.gender ? `Gender: ${clientData.client.preferences.gender}` : ""}
${clientData.client && clientData.client.preferences?.weight ? `Weight: ${clientData.client.preferences.weight}` : ""}`);

      // Add goals if available
      if (clientData.goals && clientData.goals.length > 0) {
        promptParts.push(`
Client Goals:
${clientData.goals.map((goal: any) => `- ${goal.title}: ${goal.description || ""} (Status: ${goal.status})`).join("\n")}`);
      }

      // Add metrics if available
      if (clientData.metrics && clientData.metrics.length > 0) {
        promptParts.push(`
Recent Progress Metrics:
${clientData.metrics.map((metric: any) => `- ${metric.category}: ${metric.value} ${metric.unit} (${new Date(metric.date).toLocaleDateString()})`).join("\n")}`);
      }

      // Add workout history if available and influence is significant
      if (clientData.history && clientData.history.length > 0 && pastWorkoutInfluence > 20) {
        promptParts.push(`
Recent Workout History (${pastWorkoutInfluence}% influence on this workout):
${clientData.history.map((workout: any, index: number) => {
          // Extract key information from the workout plan
          const content = typeof workout.content === 'string' ? JSON.parse(workout.content) : workout.content;
          const exercises = content.mainWorkout
            ? content.mainWorkout.flatMap((circuit: any) => 
                circuit.exercises.map((ex: any) => `${ex.exercise} (${ex.sets} × ${ex.reps})`)
              ).join(", ")
            : "No exercises recorded";
            
          return `- Workout ${index + 1}: ${workout.title} (${new Date(workout.createdAt).toLocaleDateString()})
  Focus: ${content.sessionDetails?.focusArea || "General"}
  Exercises: ${exercises}`;
        }).join("\n")}`);
      }
    }

    // Add specific instructions for warmup and cooldown
    if (!includeWarmup) {
      promptParts.push("Do NOT include a warm-up section in this workout.");
    }
    
    if (!includeCooldown) {
      promptParts.push("Do NOT include a cool-down section in this workout.");
    }

    // Add instructions for the output format
    promptParts.push(`
The response must be a valid JSON object with this exact structure:
{
  "sessionDetails": {
    "type": string, // "Group Class" or "Personal Training"
    "name": string, // Name of the workout
    "coach": "Coach Pete Ryan",
    "duration": number, // Duration in minutes
    "fitnessLevel": string,
    "focusArea": string
  },
  "introduction": {
    "overview": string, // Brief overview of the session
    "intensity": string, // Expected intensity level
    "objectives": string[], // Key objectives for the session
    "preparation": string // Pre-workout preparation advice
  },
  "equipmentNeeded": string[],
  "description": string,
  ${includeWarmup ? `"warmup": Array<{
    "exercise": string,
    "duration": string,
    "notes"?: string
  }>,` : ""}
  "mainWorkout": Array<{
    "circuitNumber": number,
    "explanation": string,
    "objective": string,
    "setupInstructions": string,
    "exercises": Array<{
      "exercise": string,
      "reps": string,
      "sets": string,
      "weight"?: string,
      "technique": string,
      "notes"?: string
    }>
  }>,
  ${includeCooldown ? `"cooldown": Array<{
    "exercise": string,
    "duration": string,
    "technique": string,
    "notes"?: string
  }>,` : ""}
  "recovery": {
    "immediateSteps": string[],
    "nutritionTips": string[],
    "restRecommendations": string,
    "nextDayGuidance": string
  }
}`);

    // Create the system prompt for the AI
    const systemPrompt = `You are an expert personal trainer with extensive knowledge of exercise science, biomechanics, and programming methodologies. You create highly personalized workout plans based on client information, preferences, and history.

Rules to follow:
1. Always create a workout plan that addresses the specific focus areas requested
2. Adapt exercise selection based on preferred equipment and avoid listed exercises
3. Scale the workout appropriately to the fitness level (beginner, intermediate, advanced)
4. If client history is provided, create a workout that builds upon previous sessions
5. Ensure the workout fits within the specified duration
6. Provide clear, specific instructions for each exercise
7. Always respond in valid JSON format exactly matching the specified schema

When reviewing client history, look for:
- Exercise progressions that can be continued
- Injury patterns or limitations to work around
- Types of workouts the client responds well to
- Gaps in recent programming that should be addressed`;

    // Call the Anthropic API to generate the workout plan
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      system: systemPrompt,
      messages: [{ role: "user", content: promptParts.join("\n\n") }],
      temperature: 0.7,
      max_tokens: 4000,
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
      console.error("Failed to parse AI response:", error);
      res.status(500).json({ 
        error: "Failed to parse workout plan",
        details: "The AI generated an invalid response format",
        rawResponse: content
      });
    }
  } catch (error: any) {
    console.error("Error generating personalized workout:", error);
    res.status(500).json({
      error: "Failed to generate personalized workout",
      details: error.message,
    });
  }
}
import type { Request, Response } from "express";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

interface ClientDetails {
  age: string;
  gender: string;
  heightCm?: string;
  weightKg?: string;
  fitnessLevel: string;
  goals: string[];
  limitations?: string[];
  preferences?: string[];
}

interface WorkoutParameters {
  duration: string;
  frequency: string;
  intensity: string;
  equipment: string[];
  location: string;
  workoutType: string;
}

interface AdaptiveSettings {
  progressionRate: string;
  adaptToPerformance: boolean;
  autoAdjustDifficulty: boolean;
  recoveryDays: string;
}

interface WorkoutGenerationRequest {
  clientDetails: ClientDetails;
  workoutParameters: WorkoutParameters;
  adaptiveSettings: AdaptiveSettings;
}

export async function generatePersonalizedWorkout(req: Request, res: Response) {
  if (!req.user) return res.sendStatus(401);

  try {
    const {
      clientDetails,
      workoutParameters,
      adaptiveSettings,
    }: WorkoutGenerationRequest = req.body;

    // Create system prompt for the AI
    const systemPrompt = `
You are an expert personal trainer specializing in creating personalized workout plans.
Your task is to create a detailed, personalized workout plan based on the client's details, goals, and constraints.

IMPORTANT RESPONSE FORMAT:
Return a valid JSON object that matches this exact structure:
{
  "title": string,
  "description": string,
  "durationMinutes": number,
  "difficulty": string,
  "targetMuscleGroups": string[],
  "equipment": string[],
  "warmup": {
    "duration": string,
    "exercises": [
      {
        "name": string,
        "instructions": string,
        "duration": string
      }
    ]
  },
  "exercises": [
    {
      "name": string,
      "sets": string,
      "reps": string,
      "rest": string,
      "notes": string,
      "alternatives": string[]
    }
  ],
  "cooldown": {
    "duration": string,
    "exercises": [
      {
        "name": string,
        "instructions": string,
        "duration": string
      }
    ]
  },
  "progressionTips": string[],
  "notes": string
}

Only respond with the JSON object, no other text.
`;

    // Create user prompt with all the details
    const userPrompt = `
Create a personalized workout plan with the following details:

CLIENT INFORMATION:
- Age: ${clientDetails.age}
- Gender: ${clientDetails.gender}
${clientDetails.heightCm ? `- Height: ${clientDetails.heightCm} cm` : ""}
${clientDetails.weightKg ? `- Weight: ${clientDetails.weightKg} kg` : ""}
- Fitness Level: ${clientDetails.fitnessLevel}
- Goals: ${clientDetails.goals.join(", ")}
${
  clientDetails.limitations && clientDetails.limitations.length > 0
    ? `- Physical Limitations: ${clientDetails.limitations.join(", ")}`
    : "- Physical Limitations: None"
}
${
  clientDetails.preferences && clientDetails.preferences.length > 0
    ? `- Exercise Preferences: ${clientDetails.preferences.join(", ")}`
    : ""
}

WORKOUT PARAMETERS:
- Duration: ${workoutParameters.duration} minutes
- Frequency: ${workoutParameters.frequency} times per week
- Intensity: ${workoutParameters.intensity}
- Equipment Available: ${
      workoutParameters.equipment.length > 0
        ? workoutParameters.equipment.join(", ")
        : "Bodyweight only"
    }
- Location: ${workoutParameters.location}
- Workout Type: ${workoutParameters.workoutType}

ADAPTIVE SETTINGS:
- Progression Rate: ${adaptiveSettings.progressionRate}
- Adapt to Performance: ${adaptiveSettings.adaptToPerformance ? "Yes" : "No"}
- Auto-Adjust Difficulty: ${
      adaptiveSettings.autoAdjustDifficulty ? "Yes" : "No"
    }
- Recovery Days: ${adaptiveSettings.recoveryDays}

Create a structured workout plan that can be easily followed by the client. Include a warm-up, main exercises with sets, reps, and rest periods, and a cool-down. If the client has any limitations, provide alternative exercises.

If auto-adjust difficulty is enabled, provide alternatives for each exercise to make it easier or harder.

Make sure the workout is appropriately challenging for the client's fitness level and aligns with their goals.
`;

    // Try with Claude first (better for structured JSON output)
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
      });

      // Parse the Claude response
      try {
        const responseText = message.content[0].text;
        // Handle possible code block formatting
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                          responseText.match(/```\n([\s\S]*?)\n```/) || 
                          responseText.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
          const planJson = jsonMatch[1] || jsonMatch[0];
          const plan = JSON.parse(planJson);
          return res.json({ plan });
        } else {
          throw new Error("Failed to parse JSON from Claude response");
        }
      } catch (parseError) {
        console.error("Error parsing Claude response:", parseError);
        throw new Error("Failed to generate structured workout plan with Claude");
      }
    } catch (claudeError) {
      console.error("Claude API error:", claudeError);
      
      // Fallback to OpenAI
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
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
      message: error.message,
    });
  }
}
