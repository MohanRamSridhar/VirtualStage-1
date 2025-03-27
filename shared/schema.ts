import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table and types
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  preferences: json("preferences").$type<UserPreferences>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UserPreferences = {
  genres: string[];
  favoriteArtists: string[];
  notificationSettings: {
    email: boolean;
    inApp: boolean;
  };
  audioQuality: "low" | "medium" | "high";
  accessibility: {
    subtitles: boolean;
    highContrast: boolean;
  };
};

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  avatar: true,
  preferences: true,
});

// Event table and types
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  type: text("type").notNull(), // concert, exhibition, theater, etc.
  genre: text("genre").notNull(),
  artist: text("artist").notNull(),
  thumbnail: text("thumbnail"),
  videoUrl: text("video_url"),
  streamUrl: text("stream_url"),
  environment: text("environment").notNull(), // stadium, theater, gallery, etc.
  isLive: boolean("is_live").default(false),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  tags: json("tags").$type<string[]>(),
  spatialAudio: boolean("spatial_audio").default(true),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

// User Event Interaction table
export const userEventInteractions = pgTable("user_event_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  attended: boolean("attended").default(false),
  bookmarked: boolean("bookmarked").default(false),
  rating: integer("rating"), // 1-5 stars
  interactionTime: timestamp("interaction_time").defaultNow(),
});

export const insertUserEventInteractionSchema = createInsertSchema(userEventInteractions).omit({
  id: true,
  interactionTime: true,
});

// Chat Message table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

// Reaction table
export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  type: text("type").notNull(), // clap, heart, wow, etc.
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  timestamp: true,
});

// Exports for all the types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type UserEventInteraction = typeof userEventInteractions.$inferSelect;
export type InsertUserEventInteraction = z.infer<typeof insertUserEventInteractionSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
