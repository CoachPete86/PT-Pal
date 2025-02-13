import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: text("role", { enum: ["trainer", "client"] }).default("client").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  specialization: text("specialization"), // For trainers: e.g., "Strength Training", "Yoga"
});

export const trainerClients = pgTable("trainer_clients", {
  id: serial("id").primaryKey(),
  trainerId: serial("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clientId: serial("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  status: text("status", { enum: ["active", "pending", "inactive"] })
    .default("pending")
    .notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  notes: text("notes"),
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
  isRead: boolean("is_read").default(false).notNull(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  trainerId: serial("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clientId: serial("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status", { enum: ["draft", "active", "completed"] })
    .default("draft")
    .notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  trainerId: serial("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clientId: serial("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  date: timestamp("date").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] })
    .default("pending")
    .notNull(),
  notes: text("notes"),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  trainerId: serial("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clientId: serial("client_id")
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", { 
    enum: ["workout_plan", "nutrition_plan", "progress_report", "general"] 
  }).default("general").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fitnessJourney = pgTable("fitness_journey", {
  id: serial("id").primaryKey(),
  clientId: serial("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  trainerId: serial("trainer_id")
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
  role: true,
  bio: true,
  specialization: true,
});

export const insertTrainerClientSchema = createInsertSchema(trainerClients)
  .omit({ id: true, startDate: true });

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans)
  .omit({ id: true })
  .extend({
    startDate: z.date(),
    endDate: z.date(),
  });

export const insertDocumentSchema = createInsertSchema(documents)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    content: z.string().min(1, "Content cannot be empty"),
    clientId: z.number().nullable(),
  });

export const insertFitnessJourneySchema = createInsertSchema(fitnessJourney)
  .omit({ id: true })
  .extend({
    date: z.date(),
  });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TrainerClient = typeof trainerClients.$inferSelect;
export type InsertTrainerClient = z.infer<typeof insertTrainerClientSchema>;
export type Message = typeof messages.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type FitnessJourney = typeof fitnessJourney.$inferSelect;
export type InsertFitnessJourney = z.infer<typeof insertFitnessJourneySchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;