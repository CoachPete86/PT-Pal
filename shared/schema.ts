import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user preferences type for better type safety
export const userPreferencesSchema = z.object({
  // Basic Profile
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
  birthdate: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),

  // Physical Information
  height: z.number().optional(),
  weight: z.number().optional(),
  bodyFatPercentage: z.number().optional(),

  // Fitness Profile
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  fitnessGoals: z.array(z.string()).optional(),
  preferredWorkoutTimes: z.array(z.string()).optional(),
  availableDays: z.array(z.string()).optional(),
  previousExperience: z.string().optional(),
  preferredActivities: z.array(z.string()).optional(),
  dislikedExercises: z.array(z.string()).optional(),

  // Health Information
  medicalConditions: z.string().optional(),
  injuries: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  hasInitialAssessment: z.boolean().optional(),
  healthConditions: z.union([z.string(), z.array(z.string())]).optional(),

  // Nutrition Information
  dietaryRestrictions: z.array(z.string()).optional(),
  mealsPerDay: z.number().optional(),
  supplementsUsed: z.string().optional(),
  waterIntake: z.string().optional(),

  // Goals & Notes
  goals: z.union([z.string(), z.array(z.string())]).optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// Core tables
export const users = pgTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: text("role", { enum: ["admin", "trainer", "client"] })
    .default("client")
    .notNull(),
  subscriptionTier: text("subscription_tier", {
    enum: ["free", "premium", "enterprise"],
  })
    .default("free")
    .notNull(),
  subscriptionStatus: text("subscription_status", {
    enum: ["active", "inactive", "trial"],
  })
    .default("trial")
    .notNull(),
  trialEndsAt: timestamp("trial_ends_at"),
  trainerId: integer("trainer_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  onboardingStatus: text("onboarding_status", {
    enum: ["pending", "in_progress", "completed"],
  })
    .default("pending")
    .notNull(),
  lastActive: timestamp("last_active"),
  profilePicture: text("profile_picture"),
  preferences: jsonb("preferences").default({}).notNull(),
  status: text("status", { enum: ["active", "inactive"] })
    .default("active")
    .notNull(),
});

// Add branding table first since workspaces reference it
export const branding = pgTable("branding", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  workspaceId: integer("workspace_id").notNull(),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color").default("#000000"),
  secondaryColor: text("secondary_color").default("#ffffff"),
  accentColor: text("accent_color").default("#3b82f6"),
  fontPrimary: text("font_primary").default("Inter"),
  fontSecondary: text("font_secondary").default("Inter"),
  customCss: text("custom_css"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Update workspace table
export const workspaces = pgTable("workspaces", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  trainerId: integer("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  logo: text("logo"),
  theme: jsonb("theme")
    .default({
      primary: "#000000",
      variant: "professional",
      appearance: "system",
      radius: 0.5,
    })
    .notNull(),
  settings: jsonb("settings")
    .default({
      allowClientRegistration: true,
      requireOnboarding: true,
      displayBranding: true,
    })
    .notNull(),
  brandingId: integer("branding_id").references(() => branding.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Onboarding Forms
export const onboardingForms = pgTable("onboarding_forms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  fields: jsonb("fields").notNull(), // Array of form field definitions
  isRequired: boolean("is_required").default(true).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const formResponses = pgTable("form_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  formId: integer("form_id")
    .references(() => onboardingForms.id, { onDelete: "cascade" })
    .notNull(),
  clientId: integer("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  responses: jsonb("responses").notNull(), // Form field responses
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  status: text("status", { enum: ["draft", "submitted", "reviewed"] })
    .default("draft")
    .notNull(),
});

// Client Goals
export const clientGoals = pgTable("client_goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientId: integer("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category", {
    enum: ["fitness", "nutrition", "weight", "performance", "lifestyle"],
  }).notNull(),
  targetDate: timestamp("target_date"),
  status: text("status", {
    enum: ["active", "completed", "cancelled", "on_hold"],
  })
    .default("active")
    .notNull(),
  progress: integer("progress").default(0).notNull(), // 0-100
  metrics: jsonb("metrics").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Document Templates
export const documentTemplates = pgTable("document_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  variables: jsonb("variables").default([]).notNull(), // Array of variable names used in template
  type: text("type", {
    enum: ["waiver", "contract", "program", "assessment", "report"],
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Generated Documents
export const generatedDocuments = pgTable("generated_documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  templateId: integer("template_id")
    .references(() => documentTemplates.id)
    .notNull(),
  clientId: integer("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  signedByClient: boolean("signed_by_client").default(false).notNull(),
  signedByTrainer: boolean("signed_by_trainer").default(false).notNull(),
  clientSignature: text("client_signature"),
  trainerSignature: text("trainer_signature"),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Add schemas for validation
export const insertOnboardingFormSchema = createInsertSchema(
  onboardingForms,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFormResponseSchema = createInsertSchema(formResponses).omit({
  id: true,
  submittedAt: true,
});

export const insertClientGoalSchema = createInsertSchema(clientGoals)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    targetDate: z.date(),
  });

export const insertDocumentTemplateSchema = createInsertSchema(
  documentTemplates,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGeneratedDocumentSchema = createInsertSchema(
  generatedDocuments,
).omit({
  id: true,
  createdAt: true,
  signedAt: true,
});

export const sessionPackages = pgTable("session_packages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  trainerId: integer("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clientId: integer("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  totalSessions: integer("total_sessions").notNull(),
  remainingSessions: integer("remaining_sessions").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const completedSessions = pgTable("completed_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  packageId: integer("package_id")
    .references(() => sessionPackages.id, { onDelete: "cascade" })
    .notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  trainerSignature: text("trainer_signature").notNull(),
  clientSignature: text("client_signature").notNull(),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSessionPackageSchema = createInsertSchema(
  sessionPackages,
).omit({
  id: true,
  createdAt: true,
  purchaseDate: true,
});

export const insertCompletedSessionSchema = createInsertSchema(
  completedSessions,
).omit({
  id: true,
  createdAt: true,
  pdfUrl: true,
});

export type SessionPackage = typeof sessionPackages.$inferSelect;
export type InsertSessionPackage = z.infer<typeof insertSessionPackageSchema>;
export type CompletedSession = typeof completedSessions.$inferSelect;
export type InsertCompletedSession = z.infer<
  typeof insertCompletedSessionSchema
>;

export const messages = pgTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  senderId: integer("sender_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  recipientId: integer("recipient_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  trainerId: integer("trainer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clientId: integer("client_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", {
    enum: [
      "workout_plan",
      "nutrition_plan",
      "progress_report",
      "template",
      "general",
    ],
  })
    .default("general")
    .notNull(),
  isTemplate: boolean("is_template").default(false).notNull(),
  notionId: text("notion_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fitnessJourney = pgTable("fitness_journey", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
    enum: ["weight", "strength", "endurance", "milestone", "measurement"],
  }).notNull(),
  value: text("value"),
  unit: text("unit"),
  status: text("status", { enum: ["achieved", "in_progress", "planned"] })
    .default("in_progress")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({
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

// Add schemas for validation
export const paymentReminders = pgTable("payment_reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  packageId: integer("package_id")
    .references(() => sessionPackages.id, { onDelete: "cascade" })
    .notNull(),
  clientId: integer("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  dueDate: timestamp("due_date").notNull(),
  remindersSent: integer("reminders_sent").default(0).notNull(),
  lastReminderSent: timestamp("last_reminder_sent"),
  status: text("status", { enum: ["pending", "sent", "overdue", "paid"] })
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientAnalytics = pgTable("client_analytics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  clientId: integer("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  metricsData: jsonb("metrics_data").default({}).notNull(), // Stores various metrics like attendance, progress, etc.
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const progressMetrics = pgTable("progress_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  clientId: integer("client_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  category: text("category", {
    enum: ["weight", "strength", "cardio", "flexibility", "measurements"],
  }).notNull(),
  value: text("value").notNull(),
  unit: text("unit").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
});

export const insertPaymentReminderSchema = createInsertSchema(
  paymentReminders,
).omit({
  id: true,
  createdAt: true,
  remindersSent: true,
  lastReminderSent: true,
});

export const insertClientAnalyticsSchema = createInsertSchema(
  clientAnalytics,
).omit({
  id: true,
  updatedAt: true,
});

export const insertProgressMetricsSchema = createInsertSchema(
  progressMetrics,
).omit({
  id: true,
});

// Export types
export type PaymentReminder = typeof paymentReminders.$inferSelect;
export type InsertPaymentReminder = z.infer<typeof insertPaymentReminderSchema>;
export type ClientAnalytics = typeof clientAnalytics.$inferSelect;
export type InsertClientAnalytics = z.infer<typeof insertClientAnalyticsSchema>;
export type ProgressMetrics = typeof progressMetrics.$inferSelect;
export type InsertProgressMetrics = z.infer<typeof insertProgressMetricsSchema>;

// Single declaration of insertUserSchema
export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
    trialEndsAt: true,
    onboardingStatus: true,
    lastActive: true,
    preferences: true,
    profilePicture: true,
    status: true,
  })
  .extend({
    password: z.string().min(8, "Password must be at least 8 characters"),
    email: z.string().email("Invalid email address"),
    preferences: userPreferencesSchema.optional(),
  });

export const insertBrandingSchema = createInsertSchema(branding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect & {
  preferences: UserPreferences;
};
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Branding = typeof branding.$inferSelect;
export type InsertBranding = z.infer<typeof insertBrandingSchema>;
export type Message = typeof messages.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type FitnessJourney = typeof fitnessJourney.$inferSelect;
export type InsertFitnessJourney = z.infer<typeof insertFitnessJourneySchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type OnboardingForm = typeof onboardingForms.$inferSelect;
export type InsertOnboardingForm = z.infer<typeof insertOnboardingFormSchema>;
export type FormResponse = typeof formResponses.$inferSelect;
export type InsertFormResponse = z.infer<typeof insertFormResponseSchema>;
export type ClientGoal = typeof clientGoals.$inferSelect;
export type InsertClientGoal = z.infer<typeof insertClientGoalSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<
  typeof insertDocumentTemplateSchema
>;
export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type InsertGeneratedDocument = z.infer<
  typeof insertGeneratedDocumentSchema
>;
