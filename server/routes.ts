import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSalesResponse } from "./services/gemini";
import { insertConversationSchema, insertSettingsSchema, messageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.saveSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid settings data", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid conversation data", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.patch("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertConversationSchema.partial().parse(req.body);
      const conversation = await storage.updateConversation(id, validatedData);
      res.json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid conversation data", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to update conversation" });
    }
  });

  // AI conversation route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, salesPrompt, apiKey } = req.body;
      
      if (!message || !salesPrompt) {
        res.status(400).json({ error: "Message and sales prompt are required" });
        return;
      }

      const response = await generateSalesResponse(message, salesPrompt, apiKey);
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Voice synthesis route
  app.post("/api/synthesize", async (req, res) => {
    try {
      const { text, voice, speed } = req.body;
      
      if (!text) {
        res.status(400).json({ error: "Text is required for synthesis" });
        return;
      }

      // This would typically integrate with a voice synthesis service
      // For now, we'll return success to allow client-side synthesis
      res.json({ 
        success: true, 
        audioUrl: null, // Client will handle synthesis
        settings: { voice, speed }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to synthesize speech" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
