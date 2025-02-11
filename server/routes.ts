import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

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

  const httpServer = createServer(app);
  return httpServer;
}
