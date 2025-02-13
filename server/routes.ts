import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import OpenAI from "openai";
import { insertDocumentSchema } from "../shared/schema";
import { Client } from "@notionhq/client";

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

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // AI Coach endpoint
  app.post("/api/ai-coach", async (req, res) => {
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
          message: "This feature requires a premium subscription. Please upgrade your plan to access AI Coach Pete."
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
      console.error("AI Coach error:", error);

      if (error.code === 'insufficient_quota') {
        res.status(500).json({ 
          error: "Service temporarily unavailable",
          message: "The AI service is currently unavailable. Please try again later."
        });
      } else {
        res.status(500).json({ 
          error: "Failed to get AI response",
          message: error.message
        });
      }
    }
  });

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