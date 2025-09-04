import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  salesPrompt: text("sales_prompt").notNull(),
  messages: jsonb("messages").notNull().default([]),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  geminiApiKey: text("gemini_api_key"),
  voiceType: text("voice_type").notNull().default("Professional Female"),
  speechSpeed: text("speech_speed").notNull().default("1"),
  audioQuality: text("audio_quality").notNull().default("High (48kHz)"),
  languageModel: text("language_model").notNull().default("Gemini Pro"),
  autoSaveConversations: boolean("auto_save_conversations").notNull().default(true),
  voiceActivityDetection: boolean("voice_activity_detection").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const messageSchema = z.object({
  role: z.enum(["user", "ai"]),
  content: z.string(),
  timestamp: z.string(),
  audioUrl: z.string().optional(),
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
export type Message = z.infer<typeof messageSchema>;
