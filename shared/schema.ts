import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: text("role", { enum: ["admin", "client"] }).default("client").notNull(),
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

// New table for fitness journey milestones
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
  value: text("value"), // Store numeric values as text to support different formats
  unit: text("unit"), // e.g., "kg", "lbs", "km", etc.
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

export const insertFitnessJourneySchema = createInsertSchema(fitnessJourney)
  .omit({ id: true })
  .extend({
    date: z.coerce.date(),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type FitnessJourney = typeof fitnessJourney.$inferSelect;
export type InsertFitnessJourney = z.infer<typeof insertFitnessJourneySchema>;