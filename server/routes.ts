import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import OpenAI from "openai";
import { insertDocumentSchema } from "../shared/schema";
import { Client } from "@notionhq/client";
import Anthropic from '@anthropic-ai/sdk';
import { format } from "date-fns";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

// Validate OpenAI API key format
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey.startsWith('sk-') || apiKey.length < 40) {
  throw new Error("Invalid OpenAI API key format. The key should start with 'sk-' and be at least 40 characters long.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
  throw new Error("Notion configuration is incomplete. Please ensure both NOTION_TOKEN and NOTION_DATABASE_ID are set.");
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable is not set");
}

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Expert Coach endpoint
  app.post("/api/expert-coach", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    try {
      const { prompt, context } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "No prompt provided" });
      }

      // Check if user has premium access
      if (req.user.role !== "premium") {
        return res.status(403).json({ 
          error: "Premium subscription required",
          message: "This feature requires a premium subscription. Please upgrade your plan to access Coach Pete's expert system."
        });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are Coach Pete, an expert personal trainer and fitness coach with decades of experience. You specialize in:
- Exercise form and technique
- Personalized workout planning
- Nutrition advice
- Athletic performance
- Injury prevention and recovery
- Mental fitness and motivation

When responding:
- Be encouraging and supportive, but maintain professional authority
- Provide clear, actionable advice
- Include relevant scientific backing when appropriate
- Prioritize safety and proper form
- Consider the user's context from their document
- Use clear formatting with headers and bullet points when appropriate

Document Context: ${context || "No context provided"}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      res.json({ response: response.choices[0].message.content });
    } catch (error: any) {
      console.error("Expert coach error:", error);

      if (error.code === 'insufficient_quota') {
        res.status(500).json({ 
          error: "Service temporarily unavailable",
          message: "The service is currently unavailable. Please try again later."
        });
      } else {
        res.status(500).json({ 
          error: "Failed to get response",
          message: error.message
        });
      }
    }
  });

  // Workout Plan Generation endpoint
  const generateWorkoutPlan = async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    try {
      const {
        sessionType,
        planType,
        classType,
        fitnessLevel,
        clientDetails,
        programDetails,
      } = req.body;

      // Create base system prompt
      const baseSystemPrompt = `You are Coach Pete Ryan's AI Assistant, specialised in creating professional workout plans following his exact blueprint structure. You have extensive knowledge of exercise science and Coach Pete's training methodology.

Rules to follow:
1. Always use the exact sections and format from the blueprint
2. Only include exercises possible with the available equipment
3. Follow CrossFit-style or circuit-based approach
4. Ensure exercise selection aligns with equipment quantities
5. No gym-based exercises requiring unavailable equipment
6. Duration must be exactly 45 minutes
7. Location is always PureGym West Byfleet
8. Always respond in valid JSON format
9. Consider client's fitness level: ${fitnessLevel}
10. Use British English spelling (e.g., customise, specialise, etc.)
${clientDetails ? `11. Adapt to client profile:
    - Age: ${clientDetails.age}
    - Gender: ${clientDetails.gender}
    - Goals: ${clientDetails.goals}
    - Limitations: ${clientDetails.limitations || 'None'}` : ''}
${sessionType === 'group' ? `12. Group Session Specifics:
    - Participants: ${req.body.participantInfo?.count || 'Variable'}
    - Format: ${req.body.participantInfo?.format || 'Individual'} workout
    ${req.body.participantInfo?.format === 'groups' ? `- Group Size: ${req.body.participantInfo.groupSize} participants per group` : ''}
    - Circuit Types: ${req.body.circuitPreferences?.types.join(', ')}
    - Station Rotation: ${req.body.circuitPreferences?.stationRotation ? 'Yes' : 'No'}
    - Rest Between Stations: ${req.body.circuitPreferences?.restBetweenStations ? 'Yes' : 'No'}
    - Mixed Equipment: ${req.body.circuitPreferences?.mixedEquipmentStations ? 'Allow' : 'Keep Simple'}` : ''}
${planType === 'program' ? `13. Include periodisation principles for ${programDetails?.sessionsPerWeek} sessions per week over 12 weeks` : ''}

Available Equipment:
- Dumbbells (kg): 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5
- Kettlebells (kg): 8, 12, 16, 20, 24
- Plyo Boxes
- Concept 2 Rowers (3 available)
- Ski Erg Machines (2 available)
- Watt Bike
- Spin Bike
- Sledge
- Battle Ropes (2 available)
- Bodybar with plates
- Step up Box
- Yoga Matt

The response must be a valid JSON object with this exact structure:
{
  "classDetails": {
    "className": string,
    "coach": "Coach Pete Ryan",
    "duration": 45,
    "location": "PureGym West Byfleet"
  },
  "equipmentNeeded": string[],
  "description": string,
  "warmup": Array<{
    "exercise": string,
    "duration": string,
    "notes"?: string
  }>,
  "mainWorkout": Array<{
    "circuitNumber": number,
    "explanation": string,
    "exercises": Array<{
      "exercise": string,
      "reps": string,
      "sets": string,
      "men": string,
      "woman": string,
      "notes"?: string
    }>
  }>,
  "cooldown": Array<{
    "exercise": string,
    "duration": string,
    "notes"?: string
  }>,
  "closingMessage": string
}`;

      const generatePrompt = planType === 'oneoff'
        ? `Generate a complete workout plan for a ${sessionType === 'group' ? classType + ' class' : 'personal training session'} that's 45 minutes long using only the available equipment.`
        : `Generate Week 1 of a 12-week progressive programme with ${programDetails?.sessionsPerWeek} sessions per week. Focus on proper periodisation and progressive overload.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        system: baseSystemPrompt,
        messages: [
          {
            role: "user",
            content: generatePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      let plan;
      try {
        plan = JSON.parse(response.content[0].text);

        // Validate required structure
        if (!plan.classDetails || !plan.mainWorkout) {
          throw new Error("Invalid response structure from AI");
        }

        // Add current date in UK format
        const currentDate = format(new Date(), 'dd/MM/yyyy');
        plan.classDetails = {
          ...plan.classDetails,
          date: currentDate
        };

        // Create a summary for Notion that fits within limits
        const notionSummary = {
          title: `${plan.classDetails.className} - ${currentDate}`,
          type: sessionType === 'group' ? 'Group Class' : 'Personal Training',
          date: currentDate,
          duration: '45 minutes',
          fitnessLevel,
          exercises: plan.mainWorkout.map(circuit => 
            circuit.exercises.map(ex => ex.exercise).join(", ")
          ).join("; "),
          equipment: plan.equipmentNeeded.join(", ")
        };

        let notionPageId = null;

        try {
          const notionResponse = await notion.pages.create({
            parent: { database_id: process.env.NOTION_DATABASE_ID! },
            properties: {
              Name: {
                title: [{ text: { content: notionSummary.title } }],
              },
              Content: {
                rich_text: [{ text: { content: JSON.stringify(notionSummary, null, 2) } }],
              },
              Type: {
                select: {
                  name: "Workout Plan"
                }
              },
              Date: {
                date: { 
                  start: new Date().toISOString()
                }
              }
            }
          });
          notionPageId = notionResponse.id;
        } catch (notionError) {
          console.error("Failed to save to Notion:", notionError);
        }

        // Save to local documents
        try {
          await storage.createDocument({
            title: notionSummary.title,
            content: JSON.stringify(plan, null, 2),
            type: "document",
            notionId: notionPageId,
            userId: req.user.id,
            parentId: null,
          });
        } catch (storageError) {
          console.error("Failed to save to local storage:", storageError);
        }

        res.json({ plan });
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        res.status(500).json({ error: "Invalid response from AI service" });
      }
    } catch (error: any) {
      console.error("Workout generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate workout plan",
        details: error.message 
      });
    }
  };

  app.post("/api/generate-workout", generateWorkoutPlan);

  // Notion sync endpoint
  app.post("/api/documents/sync", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID!,
      });

      const documents = response.results.map((page: any) => {
        const title = page.properties.Name?.title[0]?.plain_text || 'Untitled';
        const content = page.properties.Content?.rich_text[0]?.plain_text || '';

        return {
          title,
          content,
          type: "document" as const,
          parentId: null,
          notionId: page.id,
          userId: req.user!.id,
        };
      });

      const results = await Promise.all(
        documents.map(doc => storage.upsertDocument(doc))
      );

      res.json(results);
    } catch (error: any) {
      console.error("Error syncing with Notion:", error);
      res.status(500).json({ 
        error: "Failed to sync with Notion",
        details: error.message 
      });
    }
  });

  // Update Notion page endpoint
  app.post("/api/documents/:id/notion-sync", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const { title, content } = req.body;
      const { id } = req.params;

      await notion.pages.update({
        page_id: id,
        properties: {
          Name: {
            title: [{ text: { content: title } }],
          },
          Content: {
            rich_text: [{ text: { content } }],
          },
        },
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating Notion page:", error);
      res.status(500).json({ 
        error: "Failed to update Notion page",
        details: error.message 
      });
    }
  });

  // Document endpoints
  app.get("/api/documents", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const documents = await storage.getDocuments(req.user.id);
      res.json(documents);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/documents", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const document = await storage.createDocument({
        ...req.body,
        userId: req.user.id,
      });
      res.json(document);
    } catch (error: any) {
      console.error("Error creating document:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const document = await storage.updateDocument(
        parseInt(req.params.id),
        req.user.id,
        req.body
      );
      res.json(document);
    } catch (error: any) {
      console.error("Error updating document:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Fitness Journey endpoints
  app.get("/api/fitness-journey", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const journey = await storage.getFitnessJourney(req.user.id);
    res.json(journey);
  });

  app.post("/api/fitness-journey", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const entry = await storage.createFitnessJourneyEntry({
      userId: req.user.id,
      ...req.body,
    });
    res.json(entry);
  });

  // Food Analysis endpoint
  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  app.post("/api/analyze-food", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      if (!image.startsWith('data:image/')) {
        return res.status(400).json({ error: "Invalid image format. Please provide a valid base64 encoded image." });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a nutrition analysis expert. Analyze food images and provide detailed nutritional information in JSON format. Include comprehensive macro breakdowns, ingredients, brands, and meal components when visible."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image and provide detailed nutritional information in JSON format including: meal name, meal type, ingredients list, brand names (if visible), estimated calories, detailed macronutrients breakdown, and any notable healthy or concerning aspects. Return the response as a JSON object with the following structure: { mealName: string, mealType: string, ingredients: string[], brandNames: string[], calories: number, macros: { protein: { total: string, sources: { [key: string]: string } }, carbs: { total: string, sources: { [key: string]: string }, fiber: string, sugar: string }, fats: { total: string, sources: { [key: string]: string }, saturated: string, unsaturated: string } }, notes: string[], servingSize: string, healthScore: number, clientGoalsAnalysis: string[] }",
              },
              {
                type: "image_url",
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      res.json({ analysis: response.choices[0].message.content });
    } catch (error: any) {
      console.error("Food analysis error:", error);

      if (error.code === 'invalid_api_key') {
        res.status(500).json({ 
          error: "API configuration error",
          details: "There's an issue with the API configuration. Please try again later."
        });
      } else if (error.code === 'insufficient_quota') {
        res.status(500).json({ 
          error: "Service temporarily unavailable",
          details: "The service is currently unavailable. Please try again later."
        });
      } else if (error.code === 'model_not_found') {
        res.status(500).json({
          error: "Model configuration error",
          details: "The AI model is currently unavailable. Please try again later."
        });
      } else {
        res.status(500).json({ 
          error: "Failed to analyze food image",
          details: error.response?.data?.error?.message || error.message 
        });
      }
    }
  });

  // Messages endpoints
  app.get("/api/messages", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const messages = await storage.getMessages(req.user.id);
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const message = await storage.createMessage({
      senderId: req.user.id,
      ...req.body,
    });
    res.json(message);
  });

  // Bookings endpoints
  app.get("/api/bookings", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const bookings = await storage.getBookings(req.user.id);
    res.json(bookings);
  });

  app.post("/api/bookings", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const booking = await storage.createBooking({
      userId: req.user.id,
      ...req.body,
    });
    res.json(booking);
  });

  const httpServer = createServer(app);
  return httpServer;
}