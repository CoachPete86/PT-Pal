import { 
  users, workspaces, messages, bookings, fitnessJourney, documents, workoutPlans, sessionPackages, completedSessions,
  onboardingForms, formResponses, clientGoals, documentTemplates, generatedDocuments,
  type User, type InsertUser, type Workspace, type InsertWorkspace,
  type Message, type Booking, type FitnessJourney, type InsertFitnessJourney,
  type Document, type InsertDocument, type WorkoutPlan, type InsertWorkoutPlan,
  type SessionPackage, type CompletedSession, type OnboardingForm, type InsertOnboardingForm,
  type FormResponse, type InsertFormResponse, type ClientGoal, type InsertClientGoal,
  type DocumentTemplate, type InsertDocumentTemplate, type GeneratedDocument, type InsertGeneratedDocument,
  branding, type Branding, type InsertBranding,
  type PaymentReminder, type InsertPaymentReminder, type ClientAnalytics, type InsertClientAnalytics, type ProgressMetrics, type InsertProgressMetrics,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getClients(trainerId: number): Promise<User[]>;
  updateUser(id: number, data: Partial<User>): Promise<User>;

  // Session Package Management
  getSessionPackages(trainerId: number): Promise<SessionPackage[]>;
  createSessionPackage(data: {
    workspaceId: number;
    trainerId: number;
    clientId: number;
    totalSessions: number;
    remainingSessions: number;
    expiryDate?: Date;
  }): Promise<SessionPackage>;
  updateSessionPackage(id: number, data: Partial<SessionPackage>): Promise<SessionPackage>;
  completeSession(data: {
    packageId: number;
    date: Date;
    notes?: string;
    trainerSignature: string;
    clientSignature: string;
  }): Promise<CompletedSession>;

  // Workspace management
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getWorkspaceByTrainer(trainerId: number): Promise<Workspace | undefined>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  updateWorkspace(id: number, data: Partial<Workspace>): Promise<Workspace>;

  // Workout Plans
  getWorkoutPlans(workspaceId: number, clientId?: number): Promise<WorkoutPlan[]>;
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  updateWorkoutPlan(id: number, data: Partial<WorkoutPlan>): Promise<WorkoutPlan>;

  // Messages
  getMessages(workspaceId: number, userId: number): Promise<Message[]>;
  createMessage(message: Partial<Message>): Promise<Message>;

  // Bookings
  getBookings(workspaceId: number, clientId?: number): Promise<Booking[]>;
  createBooking(booking: Partial<Booking>): Promise<Booking>;
  updateBooking(id: number, data: Partial<Booking>): Promise<Booking>;

  // Fitness Journey
  getFitnessJourney(workspaceId: number, clientId: number): Promise<FitnessJourney[]>;
  createFitnessJourneyEntry(entry: InsertFitnessJourney): Promise<FitnessJourney>;

  // Documents
  getDocuments(workspaceId: number, clientId?: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, data: Partial<Document>): Promise<Document>;
  getDocumentTemplates(workspaceId: number): Promise<Document[]>;
  sessionStore: session.Store;
  upsertDocument(document: InsertDocument): Promise<Document>;

  // Onboarding Form Management
  getOnboardingForms(workspaceId: number): Promise<OnboardingForm[]>;
  createOnboardingForm(form: InsertOnboardingForm): Promise<OnboardingForm>;
  updateOnboardingForm(id: number, data: Partial<OnboardingForm>): Promise<OnboardingForm>;
  deleteOnboardingForm(id: number): Promise<void>;

  // Form Responses
  getFormResponses(formId: number): Promise<FormResponse[]>;
  getClientFormResponses(clientId: number): Promise<FormResponse[]>;
  createFormResponse(response: InsertFormResponse): Promise<FormResponse>;
  updateFormResponse(id: number, data: Partial<FormResponse>): Promise<FormResponse>;

  // Client Goals
  getClientGoals(clientId: number): Promise<ClientGoal[]>;
  createClientGoal(goal: InsertClientGoal): Promise<ClientGoal>;
  updateClientGoal(id: number, data: Partial<ClientGoal>): Promise<ClientGoal>;

  // Document Templates
  getDocumentTemplates(workspaceId: number): Promise<DocumentTemplate[]>;
  createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate>;
  updateDocumentTemplate(id: number, data: Partial<DocumentTemplate>): Promise<DocumentTemplate>;

  // Generated Documents
  getGeneratedDocuments(clientId: number): Promise<GeneratedDocument[]>;
  createGeneratedDocument(document: InsertGeneratedDocument): Promise<GeneratedDocument>;
  updateGeneratedDocument(id: number, data: Partial<GeneratedDocument>): Promise<GeneratedDocument>;
  signDocument(id: number, signature: string, role: 'client' | 'trainer'): Promise<GeneratedDocument>;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'session',
      createTableIfMissing: true
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length > 0 ? results[0] as User : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results.length > 0 ? results[0] as User : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email));
    return results.length > 0 ? results[0] as User : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await db.insert(users).values(insertUser).returning();
    return results[0] as User;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const results = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return results[0] as User;
  }

  async getClients(trainerId: number): Promise<User[]> {
    const results = await db
      .select()
      .from(users)
      .where(and(
        eq(users.role, "client"),
        eq(users.trainerId, trainerId)
      ))
      .orderBy(desc(users.id));
    return results as User[];
  }

  async createClient(data: {
    fullName: string;
    email: string;
    trainerId: number;
    workspaceId: number;
    phone?: string;
    notes?: string;
    status?: string;
    goals?: string;
    healthConditions?: string;
  }): Promise<User> {
    const results = await db
      .insert(users)
      .values({
        username: data.email.split('@')[0],
        email: data.email,
        fullName: data.fullName,
        role: "client" as const,
        trainerId: data.trainerId,
        password: Math.random().toString(36).slice(-8), // Generate a random password that will be changed on first login
        subscriptionTier: "free" as const,
        subscriptionStatus: "trial" as const,
        status: "active" as const,
        preferences: {
          goals: data.goals,
          healthConditions: data.healthConditions
        }
      })
      .returning();
    return results[0] as User;
  }

  // Workspace Management
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const results = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));
    return results.length > 0 ? results[0] as Workspace : undefined;
  }

  async getWorkspaceByTrainer(trainerId: number): Promise<Workspace | undefined> {
    const results = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.trainerId, trainerId));
    return results.length > 0 ? results[0] as Workspace : undefined;
  }

  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const results = await db
      .insert(workspaces)
      .values(workspace)
      .returning();
    return results[0] as Workspace;
  }

  async updateWorkspace(id: number, data: Partial<Workspace>): Promise<Workspace> {
    const results = await db
      .update(workspaces)
      .set(data)
      .where(eq(workspaces.id, id))
      .returning();
    return results[0] as Workspace;
  }

  // Workout Plans
  async getWorkoutPlans(workspaceId: number, clientId?: number): Promise<WorkoutPlan[]> {
    let query = db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.workspaceId, workspaceId));

    if (clientId !== undefined) {
      query = query.where(eq(workoutPlans.clientId, clientId));
    }

    return query.orderBy(desc(workoutPlans.createdAt));
  }

  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [newPlan] = await db
      .insert(workoutPlans)
      .values({
        ...plan,
        startDate: new Date(plan.startDate),
        endDate: new Date(plan.endDate),
      })
      .returning();
    return newPlan;
  }

  async updateWorkoutPlan(id: number, data: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const [plan] = await db
      .update(workoutPlans)
      .set(data)
      .where(eq(workoutPlans.id, id))
      .returning();
    return plan;
  }

  // Messages
  async getMessages(workspaceId: number, userId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.workspaceId, workspaceId),
          or(
            eq(messages.senderId, userId),
            eq(messages.recipientId, userId)
          )
        )
      )
      .orderBy(desc(messages.timestamp));
  }

  async createMessage(message: Partial<Message>): Promise<Message> {
    if (!message.content || !message.senderId || !message.recipientId || !message.workspaceId) {
      throw new Error("Missing required message fields");
    }

    const [newMessage] = await db
      .insert(messages)
      .values({
        content: message.content,
        senderId: message.senderId,
        recipientId: message.recipientId,
        workspaceId: message.workspaceId,
        timestamp: new Date(),
        isRead: false
      })
      .returning();
    return newMessage;
  }

  // Bookings
  async getBookings(workspaceId: number, clientId?: number): Promise<Booking[]> {
    let query = db
      .select()
      .from(bookings)
      .where(eq(bookings.workspaceId, workspaceId));

    if (clientId !== undefined) {
      query = query.where(eq(bookings.clientId, clientId));
    }

    return query.orderBy(desc(bookings.createdAt));
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async updateBooking(id: number, data: Partial<Booking>): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set(data)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Fitness Journey
  async getFitnessJourney(workspaceId: number, clientId: number): Promise<FitnessJourney[]> {
    return db
      .select()
      .from(fitnessJourney)
      .where(
        and(
          eq(fitnessJourney.workspaceId, workspaceId),
          eq(fitnessJourney.clientId, clientId)
        )
      )
      .orderBy(desc(fitnessJourney.date));
  }

  async createFitnessJourneyEntry(entry: InsertFitnessJourney): Promise<FitnessJourney> {
    const [newEntry] = await db
      .insert(fitnessJourney)
      .values({
        ...entry,
        date: new Date(entry.date)
      })
      .returning();
    return newEntry;
  }

  // Session Packages
  async getSessionPackages(trainerId: number): Promise<SessionPackage[]> {
    return db
      .select()
      .from(sessionPackages)
      .where(eq(sessionPackages.trainerId, trainerId))
      .orderBy(desc(sessionPackages.createdAt));
  }

  async createSessionPackage(data: {
    workspaceId: number;
    trainerId: number;
    clientId: number;
    totalSessions: number;
    remainingSessions: number;
    expiryDate?: Date;
  }): Promise<SessionPackage> {
    const [pkg] = await db
      .insert(sessionPackages)
      .values({
        ...data,
        purchaseDate: new Date(),
      })
      .returning();
    return pkg;
  }

  async updateSessionPackage(id: number, data: Partial<SessionPackage>): Promise<SessionPackage> {
    const [pkg] = await db
      .update(sessionPackages)
      .set(data)
      .where(eq(sessionPackages.id, id))
      .returning();
    return pkg;
  }

  async completeSession(data: {
    packageId: number;
    date: Date;
    notes?: string;
    trainerSignature: string;
    clientSignature: string;
  }): Promise<CompletedSession> {
    // First, update the session package to decrease remaining sessions
    const [pkg] = await db
      .select()
      .from(sessionPackages)
      .where(eq(sessionPackages.id, data.packageId));

    if (!pkg || pkg.remainingSessions <= 0) {
      throw new Error('No remaining sessions available');
    }

    await this.updateSessionPackage(data.packageId, {
      remainingSessions: pkg.remainingSessions - 1,
    });

    // Then create the completed session record
    const [session] = await db
      .insert(completedSessions)
      .values(data)
      .returning();
    return session;
  }

  // Documents
  async getDocuments(workspaceId: number, clientId?: number): Promise<Document[]> {
    let query = db
      .select()
      .from(documents)
      .where(eq(documents.workspaceId, workspaceId));

    if (clientId !== undefined) {
      query = query.where(eq(documents.clientId, clientId));
    }

    return query.orderBy(desc(documents.updatedAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDoc] = await db
      .insert(documents)
      .values({
        ...document,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newDoc;
  }

  async updateDocument(id: number, data: Partial<Document>): Promise<Document> {
    const [doc] = await db
      .update(documents)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();
    return doc;
  }

  async upsertDocument(document: InsertDocument): Promise<Document> {
    const [doc] = await db
      .insert(documents)
      .values({
        ...document,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return doc;
  }


  //Onboarding Forms
  async getOnboardingForms(workspaceId: number): Promise<OnboardingForm[]> {
    return db
      .select()
      .from(onboardingForms)
      .where(eq(onboardingForms.workspaceId, workspaceId))
      .orderBy(onboardingForms.order);
  }

  async createOnboardingForm(form: InsertOnboardingForm): Promise<OnboardingForm> {
    const [newForm] = await db
      .insert(onboardingForms)
      .values(form)
      .returning();
    return newForm;
  }

  async updateOnboardingForm(id: number, data: Partial<OnboardingForm>): Promise<OnboardingForm> {
    const [form] = await db
      .update(onboardingForms)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(onboardingForms.id, id))
      .returning();
    return form;
  }

  async deleteOnboardingForm(id: number): Promise<void> {
    await db
      .delete(onboardingForms)
      .where(eq(onboardingForms.id, id));
  }

  //Form Responses
  async getFormResponses(formId: number): Promise<FormResponse[]> {
    return db
      .select()
      .from(formResponses)
      .where(eq(formResponses.formId, formId))
      .orderBy(desc(formResponses.submittedAt));
  }

  async getClientFormResponses(clientId: number): Promise<FormResponse[]> {
    return db
      .select()
      .from(formResponses)
      .where(eq(formResponses.clientId, clientId))
      .orderBy(desc(formResponses.submittedAt));
  }

  async createFormResponse(response: InsertFormResponse): Promise<FormResponse> {
    const [newResponse] = await db
      .insert(formResponses)
      .values(response)
      .returning();
    return newResponse;
  }

  async updateFormResponse(id: number, data: Partial<FormResponse>): Promise<FormResponse> {
    const [response] = await db
      .update(formResponses)
      .set(data)
      .where(eq(formResponses.id, id))
      .returning();
    return response;
  }

  //Client Goals
  async getClientGoals(clientId: number): Promise<ClientGoal[]> {
    return db
      .select()
      .from(clientGoals)
      .where(eq(clientGoals.clientId, clientId))
      .orderBy(desc(clientGoals.createdAt));
  }

  async createClientGoal(goal: InsertClientGoal): Promise<ClientGoal> {
    const [newGoal] = await db
      .insert(clientGoals)
      .values({
        ...goal,
        targetDate: new Date(goal.targetDate)
      })
      .returning();
    return newGoal;
  }

  async updateClientGoal(id: number, data: Partial<ClientGoal>): Promise<ClientGoal> {
    const [goal] = await db
      .update(clientGoals)
      .set({
        ...data,
        updatedAt: new Date(),
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined
      })
      .where(eq(clientGoals.id, id))
      .returning();
    return goal;
  }

  //Document Templates
  async getDocumentTemplates(workspaceId: number): Promise<DocumentTemplate[]> {
    return db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.workspaceId, workspaceId))
      .orderBy(desc(documentTemplates.updatedAt));
  }

  async createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const [newTemplate] = await db
      .insert(documentTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async updateDocumentTemplate(id: number, data: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const [template] = await db
      .update(documentTemplates)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(documentTemplates.id, id))
      .returning();
    return template;
  }

  //Generated Documents
  async getGeneratedDocuments(clientId: number): Promise<GeneratedDocument[]> {
    return db
      .select()
      .from(generatedDocuments)
      .where(eq(generatedDocuments.clientId, clientId))
      .orderBy(desc(generatedDocuments.createdAt));
  }

  async createGeneratedDocument(document: InsertGeneratedDocument): Promise<GeneratedDocument> {
    const [newDocument] = await db
      .insert(generatedDocuments)
      .values(document)
      .returning();
    return newDocument;
  }

  async updateGeneratedDocument(id: number, data: Partial<GeneratedDocument>): Promise<GeneratedDocument> {
    const [document] = await db
      .update(generatedDocuments)
      .set(data)
      .where(eq(generatedDocuments.id, id))
      .returning();
    return document;
  }

  async signDocument(id: number, signature: string, role: 'client' | 'trainer'): Promise<GeneratedDocument> {
    const now = new Date();
    const [document] = await db
      .update(generatedDocuments)
      .set({
        ...(role === 'client' ? {
          signedByClient: true,
          clientSignature: signature,
        } : {
          signedByTrainer: true,
          trainerSignature: signature,
        }),
        signedAt: now,
      })
      .where(eq(generatedDocuments.id, id))
      .returning();
    return document;
  }

  // Branding Management Implementation
  async getBranding(workspaceId: number): Promise<Branding | undefined> {
    const [result] = await db
      .select()
      .from(branding)
      .where(eq(branding.workspaceId, workspaceId));
    return result;
  }

  async createBranding(brandingData: InsertBranding): Promise<Branding> {
    const [result] = await db
      .insert(branding)
      .values({
        ...brandingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return result;
  }

  async updateBranding(id: number, data: Partial<Branding>): Promise<Branding> {
    const [result] = await db
      .update(branding)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(branding.id, id))
      .returning();
    return result;
  }

  // Payment Reminders Implementation
  async getPaymentReminders(workspaceId: number): Promise<PaymentReminder[]> {
    return db
      .select()
      .from(paymentReminders)
      .where(eq(paymentReminders.workspaceId, workspaceId))
      .orderBy(desc(paymentReminders.dueDate));
  }

  async createPaymentReminder(reminder: InsertPaymentReminder): Promise<PaymentReminder> {
    const [newReminder] = await db
      .insert(paymentReminders)
      .values(reminder)
      .returning();
    return newReminder;
  }

  async updatePaymentReminder(id: number, data: Partial<PaymentReminder>): Promise<PaymentReminder> {
    const [reminder] = await db
      .update(paymentReminders)
      .set(data)
      .where(eq(paymentReminders.id, id))
      .returning();
    return reminder;
  }

  async getOverdueReminders(): Promise<PaymentReminder[]> {
    return db
      .select()
      .from(paymentReminders)
      .where(
        and(
          eq(paymentReminders.status, "pending"),
          sql`${paymentReminders.dueDate} < NOW()`
        )
      )
      .orderBy(paymentReminders.dueDate);
  }

  // Client Analytics Implementation
  async getClientAnalytics(workspaceId: number, clientId: number): Promise<ClientAnalytics[]> {
    return db
      .select()
      .from(clientAnalytics)
      .where(
        and(
          eq(clientAnalytics.workspaceId, workspaceId),
          eq(clientAnalytics.clientId, clientId)
        )
      )
      .orderBy(desc(clientAnalytics.endDate));
  }

  async createClientAnalytics(analytics: InsertClientAnalytics): Promise<ClientAnalytics> {
    const [newAnalytics] = await db
      .insert(clientAnalytics)
      .values(analytics)
      .returning();
    return newAnalytics;
  }

  async updateClientAnalytics(id: number, data: Partial<ClientAnalytics>): Promise<ClientAnalytics> {
    const [analytics] = await db
      .update(clientAnalytics)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(clientAnalytics.id, id))
      .returning();
    return analytics;
  }

  // Progress Metrics Implementation
  async getProgressMetrics(clientId: number, category?: string): Promise<ProgressMetrics[]> {
    let query = db
      .select()
      .from(progressMetrics)
      .where(eq(progressMetrics.clientId, clientId));

    if (category) {
      query = query.where(eq(progressMetrics.category, category));
    }

    return query.orderBy(desc(progressMetrics.date));
  }

  async createProgressMetric(metric: InsertProgressMetrics): Promise<ProgressMetrics> {
    const [newMetric] = await db
      .insert(progressMetrics)
      .values(metric)
      .returning();
    return newMetric;
  }

  async getClientProgress(
    clientId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ProgressMetrics[]> {
    return db
      .select()
      .from(progressMetrics)
      .where(
        and(
          eq(progressMetrics.clientId, clientId),
          sql`${progressMetrics.date} BETWEEN ${startDate} AND ${endDate}`
        )
      )
      .orderBy(progressMetrics.date);
  }
}

export const storage = new DatabaseStorage();