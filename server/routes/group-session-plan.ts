import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface SessionPlanRequest {
  sessionType: string;
  sessionFormat: string;
  fitnessLevel: string;
  participantCount: string;
  duration: string;
  focusAreas: string[];
  equipment: string[];
  sessionGoal: string;
  specialInstructions?: string;
}

export async function generateGroupSessionPlan(req: Request, res: Response) {
  if (!req.user) return res.sendStatus(401);

  try {
    const data = req.body as SessionPlanRequest;

    if (!data) {
      return res.status(400).json({ error: 'Missing plan parameters' });
    }

    // Create system prompt for Claude
    const systemPrompt = `You are creating a professional group fitness class plan for a trainer. 
Your task is to generate a detailed, structured workout plan following the provided template exactly.

IMPORTANT GUIDELINES:
1. Follow the exact session plan template structure
2. Include only exercises compatible with the specified equipment
3. Account for the fitness level: ${data.fitnessLevel}
4. Design for ${data.participantCount} participants
5. Create appropriate intensity based on the session type: ${data.sessionType}
6. Use the format: ${data.sessionFormat}
7. The session lasts exactly ${data.duration}
8. Focus on these areas: ${data.focusAreas.join(', ')}
9. Include warmup, main workout blocks, and cooldown
10. Create realistic, executable exercises
11. Include clear coaching cues and form guidance
12. Return structured JSON matching the SessionPlan interface exactly

The session should have this primary goal: ${data.sessionGoal}
${data.specialInstructions ? `Special instructions: ${data.specialInstructions}` : ''}

Available equipment: ${data.equipment.map(e => mapEquipmentId(e)).join(', ')}

When constructing the session plan, ensure:
- Logical progression from warmup to cooldown
- Variety in exercise selection
- Balanced muscle group targeting
- Sufficient rest periods
- Clear, concise instructions
- Scalable options for different fitness levels
- A motivating, engaging structure

FORMAT YOUR RESPONSE AS VALID JSON FOLLOWING THIS TEMPLATE:
{
  "sessionDetails": {
    "sessionType": "string",
    "clientName": "Group Class",
    "coach": "Coach Pete",
    "duration": "string",
    "location": "Gym Floor",
    "focus": "string"
  },
  "equipmentNeeded": {
    "equipmentList": ["string"]
  },
  "warmup": {
    "explanation": "string",
    "exercises": [
      {
        "exercise": "string",
        "durationOrReps": "string",
        "notes": "string"
      }
    ]
  },
  "mainWorkout": [
    {
      "blockTitle": "string",
      "format": "string",
      "explanation": "string",
      "exercises": [
        {
          "exercise": "string",
          "repsOrTime": "string",
          "rest": "string",
          "notes": "string",
          "technique": "string"
        }
      ]
    }
  ],
  "cooldown": {
    "explanation": "string",
    "exercises": [
      {
        "exercise": "string",
        "duration": "string",
        "notes": "string"
      }
    ]
  },
  "machineSetupGuide": {
    "explanation": "string",
    "machines": [
      {
        "machine": "string",
        "setupInstructions": "string"
      }
    ]
  },
  "closingMessage": "string",
  "progressNotes": ["string"],
  "nextSessionPreparation": ["string"]
}`;

    // Generate session plan with Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Create a detailed group fitness session plan for a ${data.sessionType} class using the ${data.sessionFormat} format. The class is for ${data.fitnessLevel} level participants, with approximately ${data.participantCount} people attending. The session will last ${data.duration} and focus on ${data.focusAreas.join(', ')}. The primary goal is ${data.sessionGoal}.`
        }
      ]
    });

    // Extract and parse the response content
    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Failed to parse plan from AI response");
    }
    
    const sessionPlan = JSON.parse(jsonMatch[0]);
    return res.json(sessionPlan);

  } catch (error: any) {
    console.error('Error generating group session plan:', error);
    return res.status(500).json({ 
      error: 'Failed to generate session plan',
      message: error.message
    });
  }
}

// Helper function to map equipment IDs to readable names
function mapEquipmentId(equipmentId: string): string {
  const equipmentMap: Record<string, string> = {
    'dumbbells': 'Dumbbells',
    'kettlebells': 'Kettlebells',
    'resistance-bands': 'Resistance Bands',
    'bodyweight': 'Bodyweight Exercises Only',
    'medicine-balls': 'Medicine Balls',
    'trx': 'TRX Suspension Trainers',
    'battle-ropes': 'Battle Ropes',
    'boxes': 'Plyo Boxes',
    'mats': 'Exercise Mats'
  };
  
  return equipmentMap[equipmentId] || equipmentId;
}