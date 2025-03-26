import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertChatMessageSchema, insertReactionSchema, insertUserEventInteractionSchema } from "@shared/schema";
import { z } from "zod";

// Helper function to handle async route handlers
const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.error("Error in route handler:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // User routes
  app.post("/api/users", asyncHandler(async (req, res) => {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }
    
    const user = await storage.createUser(userData);
    // Don't send password back in response
    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  }));
  
  // Important: More specific routes (with path params) need to be defined before less specific ones
  app.get("/api/users/username/:username", asyncHandler(async (req, res) => {
    const username = req.params.username;
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send password back in response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }));

  app.get("/api/users/:id", asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send password back in response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }));

  app.patch("/api/users/:id/preferences", asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const updatedUser = await storage.updateUserPreferences(userId, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: "Failed to update preferences" });
    }
    
    // Don't send password back in response
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  }));

  // Events routes
  // Special event routes first
  app.get("/api/events/upcoming", asyncHandler(async (_req, res) => {
    const events = await storage.getUpcomingEvents();
    res.json(events);
  }));

  app.get("/api/events/live", asyncHandler(async (_req, res) => {
    const events = await storage.getLiveEvents();
    res.json(events);
  }));
  
  app.get("/api/events/genre/:genre", asyncHandler(async (req, res) => {
    const genre = req.params.genre;
    const events = await storage.getEventsByGenre(genre);
    res.json(events);
  }));

  app.get("/api/events/artist/:artist", asyncHandler(async (req, res) => {
    const artist = req.params.artist;
    const events = await storage.getEventsByArtist(artist);
    res.json(events);
  }));

  app.get("/api/events/type/:type", asyncHandler(async (req, res) => {
    const type = req.params.type;
    const events = await storage.getEventsByType(type);
    res.json(events);
  }));
  
  // All events endpoint
  app.get("/api/events", asyncHandler(async (_req, res) => {
    const events = await storage.getAllEvents();
    res.json(events);
  }));
  
  // Individual event by ID, must be after more specific routes
  app.get("/api/events/:id", asyncHandler(async (req, res) => {
    const eventId = parseInt(req.params.id);
    const event = await storage.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.json(event);
  }));

  // User-Event interactions
  app.post("/api/interactions", asyncHandler(async (req, res) => {
    const interactionData = insertUserEventInteractionSchema.parse(req.body);
    
    // Check if user and event exist
    const user = await storage.getUser(interactionData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const event = await storage.getEvent(interactionData.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Check if interaction already exists
    const existingInteraction = await storage.getUserEventInteraction(
      interactionData.userId,
      interactionData.eventId
    );
    
    if (existingInteraction) {
      // Update existing interaction
      const updatedInteraction = await storage.updateUserEventInteraction(
        existingInteraction.id,
        interactionData
      );
      return res.json(updatedInteraction);
    }
    
    // Create new interaction
    const interaction = await storage.createUserEventInteraction(interactionData);
    res.status(201).json(interaction);
  }));

  app.get("/api/users/:userId/interactions", asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    const interactions = await storage.getUserEventInteractions(userId);
    res.json(interactions);
  }));

  // Chat messages
  app.get("/api/events/:eventId/chat", asyncHandler(async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    const messages = await storage.getChatMessages(eventId);
    res.json(messages);
  }));

  app.post("/api/chat", asyncHandler(async (req, res) => {
    const messageData = insertChatMessageSchema.parse(req.body);
    
    // Check if user and event exist
    const user = await storage.getUser(messageData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const event = await storage.getEvent(messageData.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    const message = await storage.addChatMessage(messageData);
    res.status(201).json(message);
  }));

  // Reactions
  app.get("/api/events/:eventId/reactions", asyncHandler(async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    const reactions = await storage.getReactions(eventId);
    res.json(reactions);
  }));

  app.post("/api/reactions", asyncHandler(async (req, res) => {
    const reactionData = insertReactionSchema.parse(req.body);
    
    // Check if user and event exist
    const user = await storage.getUser(reactionData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const event = await storage.getEvent(reactionData.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    const reaction = await storage.addReaction(reactionData);
    res.status(201).json(reaction);
  }));

  // Recommendations
  app.get("/api/users/:userId/recommendations", asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const recommendations = await storage.getRecommendedEvents(userId);
    res.json(recommendations);
  }));

  return httpServer;
}
