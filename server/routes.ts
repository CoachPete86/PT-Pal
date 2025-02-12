import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import OpenAI from "openai";
import { insertDocumentSchema } from "../shared/schema";

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

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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

  app.post("/api/documents/sync", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const { documents } = req.body;
      if (!Array.isArray(documents)) {
        return res.status(400).json({ error: "Invalid documents format" });
      }

      const results = await Promise.all(
        documents.map(async (doc) => {
          const parsedDoc = insertDocumentSchema.parse({
            ...doc,
            userId: req.user!.id,
          });
          return storage.upsertDocument(parsedDoc);
        })
      );

      res.json(results);
    } catch (error: any) {
      console.error("Error syncing documents:", error);
      res.status(500).json({ 
        error: "Failed to sync documents",
        details: error.message 
      });
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