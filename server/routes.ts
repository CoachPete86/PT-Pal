import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import OpenAI from "openai";
import { listDocuments, createDocument, getDocument } from "./services/notion";

const openai = new OpenAI();

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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

  // Document Management endpoints
  app.get("/api/documents", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const documents = await listDocuments();
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/documents", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const { title, type, content } = req.body;
      const document = await createDocument(title, type, content);
      res.json(document);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const content = await getDocument(req.params.id);
      res.json({ content });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Food Analysis endpoint
  app.post("/api/analyze-food", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image and provide nutritional information including: estimated calories, macronutrients (protein, carbs, fats), and any notable healthy or concerning aspects. Format the response in a clear, structured way.",
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
      });

      res.json({ analysis: response.choices[0].message.content });
    } catch (error: any) {
      console.error("Food analysis error:", error);
      res.status(500).json({ 
        error: "Failed to analyze food image",
        details: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}