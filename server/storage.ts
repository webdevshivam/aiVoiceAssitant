import { type Conversation, type InsertConversation, type Settings, type InsertSettings, type Message } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  
  // Settings
  getSettings(): Promise<Settings>;
  saveSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private conversations: Map<string, Conversation>;
  private settings: Settings | null;

  constructor() {
    this.conversations = new Map();
    this.settings = null;
  }

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = { 
      ...insertConversation, 
      id,
      messages: insertConversation.messages || [],
      isActive: insertConversation.isActive || false,
      createdAt: now,
      updatedAt: now
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation> {
    const existing = this.conversations.get(id);
    if (!existing) {
      throw new Error("Conversation not found");
    }
    
    const updated: Conversation = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations.delete(id);
  }

  async getSettings(): Promise<Settings> {
    if (!this.settings) {
      const id = randomUUID();
      const now = new Date();
      this.settings = {
        id,
        geminiApiKey: null,
        voiceType: "Professional Female",
        speechSpeed: "1",
        audioQuality: "High (48kHz)",
        languageModel: "Gemini Pro",
        autoSaveConversations: true,
        voiceActivityDetection: true,
        createdAt: now,
        updatedAt: now
      };
    }
    return this.settings;
  }

  async saveSettings(insertSettings: InsertSettings): Promise<Settings> {
    const existing = await this.getSettings();
    const updated: Settings = {
      ...existing,
      ...insertSettings,
      updatedAt: new Date()
    };
    
    this.settings = updated;
    return updated;
  }
}

export const storage = new MemStorage();
