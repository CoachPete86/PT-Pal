import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { createSubscription, SUBSCRIPTION_PRICES } from "./stripe";
import OpenAI from "openai";
import { insertDocumentSchema } from "../shared/schema";
import { Client } from "@notionhq/client";
import Anthropic from '@anthropic-ai/sdk';
import { format } from "date-fns";
import { generateSocialContent } from "./openai";

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

  // Subscription creation endpoint
  app.post("/api/create-subscription", async (req, res) => {
    try {
      const { email, subscriptionTier } = req.body;

      if (!email || !subscriptionTier) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const priceId = SUBSCRIPTION_PRICES[subscriptionTier];
      if (!priceId) {
        return res.status(400).json({ error: "Invalid subscription tier" });
      }

      const { subscriptionId, clientSecret } = await createSubscription(
        email,
        req.body.paymentMethodId,
        priceId
      );

      res.json({ subscriptionId, clientSecret });
    } catch (error: any) {
      console.error("Subscription creation error:", error);
      res.status(500).json({
        error: "Failed to create subscription",
        message: error.message
      });
    }
  });

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
      const baseSystemPrompt = `Following Coach Pete Ryan's exact blueprint structure for creating professional workout plans, with extensive knowledge of exercise science and his training methodology.

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
  "sessionDetails": {
    "type": string, // "Group Class" or "Personal Training"
    "name": string, // Class name for group, "Personal Training Session" for PT
    "coach": "Coach Pete Ryan",
    "duration": 45,
    "location": "PureGym West Byfleet",
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
  "warmup": Array<{
    "exercise": string,
    "duration": string,
    "notes"?: string
  }>,
  "mainWorkout": Array<{
    "circuitNumber": number,
    "explanation": string,
    "objective": string,
    "setupInstructions": string,
    "exercises": Array<{
      "exercise": string,
      "reps": string,
      "sets": string,
      "men": string,
      "woman": string,
      "technique": string,
      "notes"?: string
    }>
  }>,
  "cooldown": Array<{
    "exercise": string,
    "duration": string,
    "technique": string,
    "notes"?: string
  }>,
  "recovery": {
    "immediateSteps": string[],
    "nutritionTips": string[],
    "restRecommendations": string,
    "nextDayGuidance": string
  },
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

        // Validate required structure with more lenient checks
        if (!plan || typeof plan !== 'object') {
          throw new Error("Invalid response structure from AI");
        }

        // Initialize missing sections if needed
        plan.sessionDetails = plan.sessionDetails || plan.classDetails || {};
        plan.mainWorkout = plan.mainWorkout || [];

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
              },
              UserId: {
                rich_text: [{ text: { content: req.user.id.toString() } }]
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
      // Query Notion database with user filter
      const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID!,
        filter: {
          and: [
            {
              property: "UserId",
              rich_text: {
                equals: req.user.id.toString()
              }
            }
          ]
        }
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

  // Client management endpoints
  app.get("/api/clients", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const clients = await storage.getClients(req.user.id);
      res.json(clients);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
      res.status(500).json({
        error: "Failed to fetch clients",
        message: error.message
      });
    }
  });

  app.post("/api/clients", async (req, res) => {
    if (!req.user) {
      console.log("No user in session for /api/clients POST");
      return res.status(401).json({
        error: "Unauthorized",
        message: "You must be logged in to create clients"
      });
    }

    try {
      if (!req.body.fullName || !req.body.email) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Full name and email are required"
        });
      }

      // Get or create workspace for the trainer
      let workspace = await storage.getWorkspaceByTrainer(req.user.id);
      if (!workspace) {
        workspace = await storage.createWorkspace({
          trainerId: req.user.id,
          name: `${req.user.username}'s Workspace`,
        });
      }

      const client = await storage.createClient({
        ...req.body,
        trainerId: req.user.id,
        workspaceId: workspace.id
      });

      res.json(client);
    } catch (error: any) {
      console.error("Error creating client:", error);
      res.status(500).json({
        error: "Failed to create client",
        message: error.message
      });
    }
  });

  app.get("/api/workout-plans", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const plans = await storage.getWorkoutPlans(req.user.id);
      res.json(plans);
    } catch (error: any) {
      console.error("Error fetching workout plans:", error);
      res.status(500).json({
        error: "Failed to fetch workout plans",
        message: error.message
      });
    }
  });


  // Session package endpoints
  app.get("/api/session-packages", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const packages = await storage.getSessionPackages(req.user.id);
      res.json(packages);
    } catch (error: any) {
      console.error("Error fetching session packages:", error);
      // Send a more graceful error response
      if (error.code === '42P01') { // Table doesn't exist
        res.status(500).json({
          error: "Service temporarily unavailable",
          message: "The session tracking service is currently being set up."
        });
      } else {
        res.status(500).json({
          error: "Failed to fetch session packages",
          message: error.message
        });
      }
    }
  });

  app.post("/api/session-packages", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const sessionPackage = await storage.createSessionPackage({
        trainerId: req.user.id,
        ...req.body,
      });
      res.json(sessionPackage);
    } catch (error: any) {
      console.error("Error creating session package:", error);
      res.status(500).json({
        error: "Failed to create session package",
        message: error.message
      });
    }
  });

  app.post("/api/complete-session", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const session = await storage.completeSession({
        packageId: req.body.packageId,
        notes: req.body.notes,
        trainerSignature: req.body.trainerSignature,
        clientSignature: req.body.clientSignature,
        date: new Date(),
      });
      res.json(session);
    } catch (error: any) {
      console.error("Error completing session:", error);
      res.status(500).json({
        error: "Failed to complete session",
        message: error.message
      });
    }
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

  // Social Media Content Generation endpoint
  app.post("/api/social/generate", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    try {
      const content = await generateSocialContent(req.body);
      res.json({ content });
    } catch (error: any) {
      console.error("Social content generation error:", error);

      if (error.code === 'insufficient_quota') {
        res.status(500).json({
          error: "Service temporarily unavailable",
          message: "The service is currently unavailable. Please try again later."
        });
      } else {
        res.status(500).json({
          error: "Failed to generate content",
          message: error.message
        });
      }
    }
  });

  // Branding endpoints
  app.get("/api/branding", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const workspace = await storage.getWorkspaceByTrainer(req.user.id);
      if (!workspace) {
        return res.status(404).json({ error: "Workspace not found" });
      }
      const branding = await storage.getBranding(workspace.id);
      res.json(branding || {});
    } catch (error: any) {
      console.error("Error fetching branding:", error);
      res.status(500).json({
        error: "Failed to fetch branding",
        message: error.message
      });
    }
  });

  app.patch("/api/branding", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const workspace = await storage.getWorkspaceByTrainer(req.user.id);
      if (!workspace) {
        return res.status(404).json({ error: "Workspace not found" });
      }

      let branding = await storage.getBranding(workspace.id);
      if (!branding) {
        branding = await storage.createBranding({
          workspaceId: workspace.id,
          ...req.body
        });
      } else {
        branding = await storage.updateBranding(branding.id, req.body);
      }

      res.json(branding);
    } catch (error: any) {
      console.error("Error updating branding:", error);
      res.status(500).json({
        error: "Failed to update branding",
        message: error.message
      });
    }
  });

  app.post("/api/branding/logo", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const workspace = await storage.getWorkspaceByTrainer(req.user.id);
      if (!workspace) {
        return res.status(404).json({ error: "Workspace not found" });
      }

      // Handle file upload logic here
      // For now, we'll just update the URL
      const { logoUrl } = req.body;
      let branding = await storage.getBranding(workspace.id);

      if (!branding) {
        branding = await storage.createBranding({
          workspaceId: workspace.id,
          logoUrl
        });
      } else {
        branding = await storage.updateBranding(branding.id, { logoUrl });
      }

      res.json(branding);
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      res.status(500).json({
        error: "Failed to upload logo",
        message: error.message
      });
    }
  });

  //NEW ROUTES FROM EDITED SNIPPET
  app.get("/api/onboarding-forms", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const workspaceId = await storage.getWorkspaceByTrainer(req.user.id);
      if (!workspaceId) {
        return res.status(404).json({ error: "Workspace not found" });
      }
      const forms = await storage.getOnboardingForms(workspaceId);
      res.json(forms);
    } catch (error: any) {
      console.error("Error fetching onboarding forms:", error);
      res.status(500).json({
        error: "Failed to fetch onboarding forms",
        message: error.message
      });
    }
  });

  app.post("/api/onboarding-forms", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const form = await storage.createOnboardingForm({
        ...req.body,
        workspaceId: req.user.workspaceId,
      });
      res.json(form);
    } catch (error: any) {
      console.error("Error creating onboarding form:", error);
      res.status(500).json({
        error: "Failed to create onboarding form",
        message: error.message
      });
    }
  });

  app.patch("/api/onboarding-forms/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const form = await storage.updateOnboardingForm(
        parseInt(req.params.id),
        req.body
      );
      res.json(form);
    } catch (error: any) {
      console.error("Error updating onboarding form:", error);
      res.status(500).json({
        error: "Failed to update onboarding form",
        message: error.message
      });
    }
  });

  app.delete("/api/onboarding-forms/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      await storage.deleteOnboardingForm(parseInt(req.params.id));
      res.sendStatus(200);
    } catch (error: any) {
      console.error("Error deleting onboarding form:", error);
      res.status(500).json({
        error: "Failed to delete onboarding form",
        message: error.message
      });
    }
  });

  // Form Responses
  app.get("/api/form-responses/:formId", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const responses = await storage.getFormResponses(parseInt(req.params.formId));
      res.json(responses);
    } catch (error: any) {
      console.error("Error fetching formresponses:", error);
      res.status(500).json({
        error: "Failed to fetch form responses",
        message: error.message
      });
    }
  });

  app.post("/api/form-responses", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const response = await storage.createFormResponse({
        ...req.body,
        clientId: req.user.id,
      });
      res.json(response);
    } catch (error: any) {
      console.error("Error creating form response:", error);
      res.status(500).json({
        error: "Failed to create form response",
        message: error.message
      });
    }
  });

  // Client Goals
  app.get("/api/client-goals/:clientId", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const goals = await storage.getClientGoals(parseInt(req.params.clientId));
      res.json(goals);
    } catch (error: any) {
      console.error("Error fetching client goals:", error);
      res.status(500).json({
        error: "Failed to fetch client goals",
        message: error.message
      });
    }
  });

  app.post("/api/client-goals", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const goal = await storage.createClientGoal({
        ...req.body,
        clientId: req.body.clientId || req.user.id,
      });
      res.json(goal);
    } catch (error: any) {
      console.error("Error creating client goal:", error);
      res.status(500).json({
        error: "Failed to create client goal",
        message: error.message
      });
    }
  });

  app.patch("/api/client-goals/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const goal = await storage.updateClientGoal(
        parseInt(req.params.id),
        req.body
      );
      res.json(goal);
    } catch (error: any) {
      console.error("Error updating client goal:", error);
      res.status(500).json({
        error: "Failed to update client goal",
        message: error.message
      });
    }
  });

  // Document Templates
  app.get("/api/document-templates", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const workspaceId = await storage.getWorkspaceByTrainer(req.user.id);
      if (!workspaceId) {
        return res.status(404).json({ error: "Workspace not found" });
      }
      const templates = await storage.getDocumentTemplates(workspaceId);
      res.json(templates);
    } catch (error: any) {
      console.error("Error fetching document templates:", error);
      res.status(500).json({
        error: "Failed to fetch document templates",
        message: error.message
      });
    }
  });

  app.post("/api/document-templates", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const template = await storage.createDocumentTemplate({
        ...req.body,
        workspaceId: req.user.workspaceId,
      });
      res.json(template);
    } catch (error: any) {
      console.error("Error creating document template:", error);
      res.status(500).json({
        error: "Failed to create document template",
        message: error.message
      });
    }
  });

  // Generated Documents
  app.get("/api/generated-documents/:clientId", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const documents = await storage.getGeneratedDocuments(parseInt(req.params.clientId));
      res.json(documents);
    } catch (error: any) {
      console.error("Error fetching generated documents:", error);
      res.status(500).json({
        error: "Failed to fetch generated documents",
        message: error.message
      });
    }
  });

  app.post("/api/generated-documents", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const document = await storage.createGeneratedDocument(req.body);
      res.json(document);
    } catch (error: any) {
      console.error("Error creating generated document:", error);
      res.status(500).json({
        error: "Failed to create generated document",
        message: error.message
      });
    }
  });

  app.post("/api/generated-documents/:id/sign", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const { signature, role } = req.body;
      const document = await storage.signDocument(
        parseInt(req.params.id),
        signature,
        role
      );
      res.json(document);
    } catch (error: any) {
      console.error("Error signing document:", error);
      res.status(500).json({
        error: "Failed to sign document",
        message: error.message
      });
    }
  });

  // Payment Reminders
  app.get("/api/payment-reminders", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const workspaceId = req.user.workspaceId;
      if (!workspaceId) {
        return res.status(404).json({ error: "Workspace not found" });
      }
      const reminders = await storage.getPaymentReminders(workspaceId);
      res.json(reminders);
    } catch (error: any) {
      console.error("Error fetching payment reminders:", error);
      res.status(500).json({
        error: "Failed to fetch payment reminders",
        message: error.message
      });
    }
  });

  app.post("/api/payment-reminders", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const reminder = await storage.createPaymentReminder({
        ...req.body,
        workspaceId: req.user.workspaceId,
      });
      res.json(reminder);
    } catch (error: any) {
      console.error("Error creating payment reminder:", error);
      res.status(500).json({
        error: "Failed to create payment reminder",
        message: error.message
      });
    }
  });

  app.patch("/api/payment-reminders/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const reminder = await storage.updatePaymentReminder(
        parseInt(req.params.id),
        req.body
      );
      res.json(reminder);
    } catch (error: any) {
      console.error("Error updating payment reminder:", error);
      res.status(500).json({
        error: "Failed to update payment reminder",
        message: error.message
      });
    }
  });

  // Client Analytics
  app.get("/api/client-analytics/:clientId", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const analytics = await storage.getClientAnalytics(
        req.user.workspaceId,
        parseInt(req.params.clientId)
      );
      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching client analytics:", error);
      res.status(500).json({
        error: "Failed to fetch client analytics",
        message: error.message
      });
    }
  });

  app.post("/api/client-analytics", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const analytics = await storage.createClientAnalytics({
        ...req.body,
        workspaceId: req.user.workspaceId,
      });
      res.json(analytics);
    } catch (error: any) {
      console.error("Error creating client analytics:", error);
      res.status(500).json({
        error: "Failed to create client analytics",
        message: error.message
      });
    }
  });

  // Progress Metrics endpoints
  app.get("/api/progress-metrics/:clientId", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const metrics = await storage.getProgressMetrics(
        parseInt(req.params.clientId),
        req.query.category as string | undefined
      );
      res.json(metrics);
    } catch (error: any) {
      console.error("Error fetching progress metrics:", error);
      res.status(500).json({
        error: "Failed to fetch progress metrics",
        message: error.message
      });
    }
  });

  app.post("/api/progress-metrics", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const metric = await storage.createProgressMetric({
        ...req.body,
        date: new Date(req.body.date || new Date()),
      });
      res.json(metric);
    } catch (error: any) {
      console.error("Error creating progress metric:", error);
      res.status(500).json({
        error: "Failed to create progress metric",
        message: error.message
      });
    }
  });

  app.get("/api/progress-metrics/:clientId/trend", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const startDate = new Date(req.query.startDate as string || new Date());
      const endDate = new Date(req.query.endDate as string || new Date());

      const progress = await storage.getClientProgress(
        parseInt(req.params.clientId),
        startDate,
        endDate
      );
      res.json(progress);
    } catch (error: any) {
      console.error("Error fetching progress trend:", error);
      res.status(500).json({
        error: "Failed to fetch progress trend",
        message: error.message
      });
    }
  });

  //NEW ROUTES FROM EDITED SNIPPET
  // Workspace endpoint
  app.get("/api/workspace", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      let workspace = await storage.getWorkspaceByTrainer(req.user.id);
      if (!workspace) {
        workspace = await storage.createWorkspace({
          trainerId: req.user.id,
          name: `${req.user.username}'s Workspace`,
        });
      }
      res.json(workspace);
    } catch (error: any) {
      console.error("Error fetching workspace:", error);
      res.status(500).json({
        error: "Failed to fetch workspace",
        message: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}