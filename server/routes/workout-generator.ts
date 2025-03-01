import { Request, Response } from 'express';
import { anthropic } from '@anthropic-ai/sdk';
import { storage } from '../storage';

// Initialize Anthropic client
const client = new anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function generateWorkout(req: Request, res: Response) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ 
        error: 'API key missing', 
        details: 'Anthropic API key is not configured' 
      });
    }

    const { 
      sessionType, 
      fitnessLevel, 
      equipment, 
      circuitPreferences,
      clientDetails,
      groupFormat,
      planType,
      participantInfo
    } = req.body;

    // Build the prompt for Claude
    let prompt = `Create a detailed workout plan based on the following information:

Session Type: ${sessionType} (${sessionType === 'group' ? 'Group Class' : 'Personal Training'})
Fitness Level: ${fitnessLevel}
Available Equipment: ${equipment.join(', ')}
Circuit Types Preferred: ${circuitPreferences.types.join(', ')}

`;

    if (sessionType === 'personal') {
      prompt += `
Client Details:
- Age: ${clientDetails?.age || 'Not specified'}
- Gender: ${clientDetails?.gender || 'Not specified'}
- Goals: ${clientDetails?.goals || 'Not specified'}
- Limitations: ${clientDetails?.limitations || 'Not specified'}
- Experience Level: ${clientDetails?.experience || 'Not specified'}
- Plan Type: ${planType}
      `;
    } else {
      prompt += `
Group Details:
- Format: ${groupFormat?.type}
- Participant Count: ${participantInfo?.count || 'Not specified'}
- Group Setup: ${participantInfo?.format || 'Individual'}
      `;
    }

    prompt += `

I need a structured workout plan with:
1. Introduction - describing the overall approach, intensity level, and objectives
2. Main Workout - detailed breakdown of circuits, each with specific exercises, reps/sets, and technique notes
3. Recovery recommendations

Present the workout in a structured JSON format with the following structure:
{
  "introduction": {
    "overview": "Brief overview of the workout",
    "intensity": "Intensity level description",
    "objectives": ["Objective 1", "Objective 2"],
    "preparation": "Preparation instructions"
  },
  "mainWorkout": [
    {
      "circuitNumber": 1,
      "explanation": "Description of circuit purpose",
      "objective": "Specific goal of this circuit",
      "setupInstructions": "How to set up for this circuit",
      "exercises": [
        {
          "exercise": "Exercise name",
          "reps": "Rep count or time",
          "sets": "Number of sets",
          "men": "Modified rep/weight for men if applicable",
          "woman": "Modified rep/weight for women if applicable",
          "technique": "Detailed technique instructions",
          "notes": "Additional important notes"
        }
      ]
    }
  ],
  "recovery": {
    "immediateSteps": ["Step 1", "Step 2"],
    "nutritionTips": ["Tip 1", "Tip 2"],
    "restRecommendations": "Rest period advice",
    "nextDayGuidance": "Guidance for following day"
  }
}
`;

    // Call Anthropic API to generate the plan
    const message = await client.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      messages: [
        { 
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7,
    });
    
    // Parse the JSON content from the response
    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)```/) || 
                     responseText.match(/```\n([\s\S]*?)```/) || 
                     responseText.match(/{[\s\S]*}/);
    
    let plan;
    
    if (jsonMatch) {
      try {
        plan = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (error) {
        console.error("Error parsing JSON from Anthropic response", error);
        return res.status(500).json({ 
          error: "Failed to parse workout plan", 
          details: "The AI generated an invalid JSON response"
        });
      }
    } else {
      return res.status(500).json({ 
        error: "Invalid response format", 
        details: "The AI didn't return a properly formatted workout plan"
      });
    }

    // Save the generated plan if the user is authenticated
    if (req.isAuthenticated() && req.user) {
      try {
        const workout = await storage.createWorkoutPlan({
          workspaceId: req.body.workspaceId,
          trainerId: req.user.id,
          clientId: req.body.clientId,
          name: `${fitnessLevel} ${sessionType} Workout`,
          content: plan,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        return res.status(201).json({ 
          success: true, 
          plan, 
          workoutId: workout.id 
        });
      } catch (error) {
        console.error("Error saving workout plan", error);
        // Still return the generated plan but with a warning
        return res.status(200).json({ 
          success: true, 
          plan, 
          warning: "Plan was generated but could not be saved to database"
        });
      }
    } else {
      // Return the plan without saving it
      return res.status(200).json({ 
        success: true, 
        plan
      });
    }
  } catch (error) {
    console.error("Error generating workout plan", error);
    return res.status(500).json({ 
      error: "Failed to generate workout plan", 
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
