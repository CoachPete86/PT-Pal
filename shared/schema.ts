import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email").notNull(),
  role: text("role", { enum: ["admin", "trainer", "client"] }).default("client").notNull(),
  subscriptionTier: text("subscription_tier", { 
    enum: ["free", "premium", "enterprise"] 
  }).default("free").notNull(),
  subscriptionStatus: text("subscription_status", {
    enum: ["active", "inactive", "trial"]
  }).default("trial").notNull(),
  trialEndsAt: timestamp("trial_ends_at"),
  trainerId: integer("trainer_id").references(() => users.id, { onDelete: "set null" }),
  bio: text("bio"),
  profileImage: text("profile_image"),
  businessName: text("business_name"),
  businessLogo: text("business_logo"),
  notionDatabaseId: text("notion_database_id"),
  settings: jsonb("settings").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  trainerId: integer("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  logo: text("logo"),
  theme: jsonb("theme").default({}).notNull(),
  settings: jsonb("settings").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
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
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  trainerId: integer("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clientId: integer("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: jsonb("content").default({}).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status", { enum: ["draft", "active", "completed", "archived"] })
    .default("draft")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  trainerId: integer("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clientId: integer("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  type: text("type", { enum: ["individual", "group"] }).notNull(),
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] })
    .default("pending")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  trainerId: integer("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clientId: integer("client_id")
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", { 
    enum: ["workout_plan", "nutrition_plan", "progress_report", "template", "general"] 
  }).default("general").notNull(),
  isTemplate: boolean("is_template").default(false).notNull(),
  notionId: text("notion_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fitnessJourney = pgTable("fitness_journey", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  trainerId: integer("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clientId: integer("client_id")
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
    trialEndsAt: true,
    notionDatabaseId: true,
    settings: true,
  })
  .extend({
    password: z.string().min(8, "Password must be at least 8 characters"),
    email: z.string().email("Invalid email address"),
  });

export const insertWorkspaceSchema = createInsertSchema(workspaces)
  .omit({
    id: true,
    createdAt: true,
    settings: true,
    theme: true,
  });

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans)
  .omit({
    id: true,
    createdAt: true,
    content: true,
  })
  .extend({
    startDate: z.date(),
    endDate: z.date(),
  });

export const insertDocumentSchema = createInsertSchema(documents)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    notionId: true,
  })
  .extend({
    content: z.string().min(1, "Content cannot be empty"),
  });

export const insertFitnessJourneySchema = createInsertSchema(fitnessJourney)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    date: z.date(),
  });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Message = typeof messages.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type FitnessJourney = typeof fitnessJourney.$inferSelect;
export type InsertFitnessJourney = z.infer<typeof insertFitnessJourneySchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;