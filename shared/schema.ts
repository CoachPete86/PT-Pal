import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: text("role", { enum: ["admin", "client", "premium"] }).default("client").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: serial("sender_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  recipientId: serial("recipient_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: serial("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  date: timestamp("date").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] })
    .default("pending")
    .notNull(),
  notes: text("notes"),
});

// New table for documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: serial("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Rich text content
  parentId: integer("parent_id"), // For folder hierarchy, null means root
  type: text("type", { enum: ["document", "folder"] }).default("document").notNull(),
  notionId: text("notion_id"), // New field for Notion integration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fitnessJourney = pgTable("fitness_journey", {
  id: serial("id").primaryKey(),
  userId: serial("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  category: text("category", {
    enum: ["weight", "strength", "endurance", "milestone", "measurement"]
  }).notNull(),
  value: text("value"),
  unit: text("unit"),
  status: text("status", { enum: ["achieved", "in_progress", "planned"] })
    .default("in_progress")
    .notNull(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
});

export const insertDocumentSchema = createInsertSchema(documents)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    content: z.string().min(1, "Content cannot be empty"),
    parentId: z.number().nullable(),
    notionId: z.string().optional(),
  });

export const insertFitnessJourneySchema = createInsertSchema(fitnessJourney)
  .omit({ id: true })
  .extend({
    date: z.date(),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type FitnessJourney = typeof fitnessJourney.$inferSelect;
export type InsertFitnessJourney = z.infer<typeof insertFitnessJourneySchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;