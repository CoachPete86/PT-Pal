import { Request, Response } from 'express';
import { Anthropic } from '@anthropic-ai/sdk';
import { storage } from '../storage';

// Initialize Anthropic client
const client = new Anthropic({
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
Available Equipment: ${Array.isArray(equipment) ? equipment.join(', ') : equipment}
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

Present the workout as a structured SessionPlan JSON with the following structure:
{
  "sessionDetails": {
    "sessionType": "Group Training or Personal Training",
    "clientName": "Client name from request or 'Client'",
    "coach": "Coach name from request or 'Coach'",
    "duration": "45 Minutes",
    "location": "Location from request or 'Gym'",
    "date": "Current date"
  },
  "equipmentNeeded": {
    "equipmentList": ["Equipment 1", "Equipment 2", "Equipment 3"],
    "other": "Additional equipment notes"
  },
  "warmup": {
    "explanation": "Brief explanation of warmup purpose",
    "exercises": [
      {
        "exercise": "Exercise name",
        "durationOrReps": "Time or rep count",
        "notes": "Form cues or other notes"
      }
    ]
  },
  "mainWorkout": [
    {
      "blockTitle": "WORKOUT BLOCK 1",
      "format": "Format description (e.g., '3 rounds, 40s work/20s rest')",
      "explanation": "Instructions for completing this block",
      "exercises": [
        {
          "exercise": "Exercise name",
          "repsOrTime": "Rep count or duration",
          "notes": "Form cues, modifications, or other guidance"
        }
      ]
    }
  ],
  "extraWork": {
    "explanation": "Instructions for optional additional work",
    "exercises": [
      {
        "exercise": "Exercise name",
        "sets": "Number of sets",
        "reps": "Reps per set",
        "notes": "Additional notes"
      }
    ]
  },
  "cooldown": {
    "explanation": "Brief explanation of cooldown purpose",
    "exercises": [
      {
        "exercise": "Exercise name",
        "duration": "Duration to hold stretch or perform movement",
        "notes": "Form cues or breathing instructions"
      }
    ]
  },
  "machineSetupGuide": {
    "explanation": "General guidance on machine setup",
    "machines": [
      {
        "machine": "Machine name",
        "setupInstructions": "Detailed setup instructions"
      }
    ]
  },
  "closingMessage": "Final encouragement and key reminders",
  "progressNotes": [
    "Note about exercise form",
    "Note about improvements",
    "Areas for future focus"
  ],
  "nextSessionPreparation": [
    "What to focus on next time",
    "Equipment to prepare",
    "Recovery guidance"
  ]
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
    const contentBlock = message.content[0];
    
    // Check content type and extract text
    let responseText = '';
    if ('text' in contentBlock) {
      responseText = contentBlock.text;
    } else {
      return res.status(500).json({
        error: "Invalid response format",
        details: "The AI didn't return a proper text response"
      });
    }
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
        // Create a workout plan without the content first
        const workout = await storage.createWorkoutPlan({
          workspaceId: req.body.workspaceId || 1, // Default to 1 if not provided
          trainerId: req.user.id,
          clientId: req.body.clientId || req.user.id, // Default to trainer if not provided
          title: `${fitnessLevel || 'Custom'} ${sessionType} Workout`,
          description: `Generated on ${new Date().toLocaleDateString()}`,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        });
        
        // Then update the plan with the content
        await storage.updateWorkoutPlan(workout.id, {
          content: plan
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
