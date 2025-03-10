import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

// Schema for message validation
const messageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  receiverId: z.number().positive("Receiver ID must be a positive number"),
});

// Get all clients for the current user (trainer)
export async function getClients(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const trainerId = req.user.id;
    const clients = await storage.getClients(trainerId);
    
    // Add some sample data for UI testing
    const clientsWithExtra = clients.map(client => ({
      ...client,
      lastActive: client.lastActive || new Date().toISOString(),
      unreadCount: Math.floor(Math.random() * 5), // Random number for demo
      avatar: null // No avatars in our system yet
    }));

    res.json(clientsWithExtra);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
}

// Get messages between current user and another user
export async function getMessages(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get the client ID from the URL parameter
    const clientId = parseInt(req.params.clientId);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "Invalid client ID" });
    }

    const trainerId = req.user.id;
    
    // Get the workspace for this user
    const workspace = await storage.getWorkspaceByTrainer(trainerId);
    
    if (!workspace) {
      return res.status(400).json({ error: "User has no associated workspace" });
    }
    
    const workspaceId = workspace.id;

    // In a real implementation, we would fetch real messages
    // For now, we'll generate some sample messages
    const sampleMessages = [
      {
        id: 1,
        content: "Hello, how are you doing today?",
        senderId: trainerId,
        receiverId: clientId,
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: true
      },
      {
        id: 2,
        content: "I'm good, thanks! Looking forward to our session tomorrow.",
        senderId: clientId,
        receiverId: trainerId,
        timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 min ago
        read: true
      },
      {
        id: 3,
        content: "Great! I've prepared a special workout for you.",
        senderId: trainerId,
        receiverId: clientId,
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        read: true
      },
      {
        id: 4,
        content: "Can't wait! By the way, I've been following the diet plan and feeling much better.",
        senderId: clientId,
        receiverId: trainerId,
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 min ago
        read: false
      }
    ];

    res.json(sampleMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

// Send a new message
export async function sendMessage(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const validation = messageSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.flatten() });
    }

    const { content, receiverId } = validation.data;
    const senderId = req.user.id;
    
    // Get the workspace for this user
    const workspace = await storage.getWorkspaceByTrainer(senderId);
    
    if (!workspace) {
      return res.status(400).json({ error: "User has no associated workspace" });
    }
    
    const workspaceId = workspace.id;

    // In a real implementation, we would save the message to the database
    // For now, we'll just return a successful response
    const newMessage = {
      id: Date.now(), // Generate a unique ID
      content,
      senderId,
      receiverId,
      timestamp: new Date().toISOString(),
      read: false
    };

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
}