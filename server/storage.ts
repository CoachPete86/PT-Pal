import { 
  users, workspaces, messages, bookings, fitnessJourney, documents, workoutPlans,
  type User, type InsertUser, type Workspace, type InsertWorkspace,
  type Message, type Booking, type FitnessJourney, type InsertFitnessJourney,
  type Document, type InsertDocument, type WorkoutPlan, type InsertWorkoutPlan
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { notion } from "./notion";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getClients(trainerId: number): Promise<User[]>;
  updateUser(id: number, data: Partial<User>): Promise<User>;

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
  setupNotionForWorkspace(workspaceId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getClients(trainerId: number): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(and(
        eq(users.role, "client"),
        eq(users.trainerId, trainerId)
      ))
      .orderBy(desc(users.id));
  }

  // Workspace Management
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));
    return workspace;
  }

  async getWorkspaceByTrainer(trainerId: number): Promise<Workspace | undefined> {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.trainerId, trainerId));
    return workspace;
  }

  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const [newWorkspace] = await db
      .insert(workspaces)
      .values(workspace)
      .returning();
    return newWorkspace;
  }

  async updateWorkspace(id: number, data: Partial<Workspace>): Promise<Workspace> {
    const [workspace] = await db
      .update(workspaces)
      .set(data)
      .where(eq(workspaces.id, id))
      .returning();
    return workspace;
  }

  // Workout Plans
  async getWorkoutPlans(workspaceId: number, clientId?: number): Promise<WorkoutPlan[]> {
    let query = db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.workspaceId, workspaceId));

    if (clientId !== undefined) {
      query = query.$dynamic().where(eq(workoutPlans.clientId, clientId));
    }

    return query.orderBy(desc(workoutPlans.startDate));
  }

  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [result] = await db
      .insert(workoutPlans)
      .values(plan)
      .returning();
    return result;
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
      query = query.$dynamic().where(eq(bookings.clientId, clientId));
    }

    return query.orderBy(desc(bookings.date));
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    if (!booking.workspaceId || !booking.trainerId || !booking.clientId || !booking.date) {
      throw new Error("Missing required booking fields");
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        workspaceId: booking.workspaceId,
        trainerId: booking.trainerId,
        clientId: booking.clientId,
        date: new Date(booking.date),
        duration: booking.duration || 60,
        type: booking.type || "individual",
        status: booking.status || "pending",
        notes: booking.notes || null
      })
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

  // Documents
  async getDocuments(workspaceId: number, clientId?: number): Promise<Document[]> {
    let query = db
      .select()
      .from(documents)
      .where(eq(documents.workspaceId, workspaceId));

    if (clientId !== undefined) {
      query = query.$dynamic().where(eq(documents.clientId, clientId));
    }

    return query.orderBy(desc(documents.updatedAt));
  }

  async getDocumentTemplates(workspaceId: number): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.workspaceId, workspaceId),
          eq(documents.isTemplate, true)
        )
      )
      .orderBy(desc(documents.updatedAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    if (!document.content || !document.title || !document.workspaceId) {
      throw new Error("Missing required document fields");
    }

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
    const [updatedDoc] = await db
      .update(documents)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();
    return updatedDoc;
  }

  async setupNotionForWorkspace(workspaceId: number): Promise<void> {
    try {
      const [workspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId));

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      const [trainer] = await db
        .select()
        .from(users)
        .where(eq(users.id, workspace.trainerId));

      if (!trainer) {
        throw new Error("Trainer not found");
      }

      const database = await notion.databases.retrieve({
        database_id: process.env.NOTION_DATABASE_ID!
      });

      // Add workspace-specific properties
      if (!database.properties['WorkspaceId']) {
        await notion.databases.update({
          database_id: process.env.NOTION_DATABASE_ID!,
          properties: {
            ...database.properties,
            WorkspaceId: {
              number: {}
            }
          }
        });
      }
    } catch (error) {
      console.error("Failed to setup Notion for workspace:", error);
      throw error;
    }
  }
  // Add the upsertDocument method
  async upsertDocument(document: InsertDocument & { notionId?: string | null }): Promise<Document> {
    const existing = document.notionId 
      ? await db
          .select()
          .from(documents)
          .where(eq(documents.notionId, document.notionId))
          .limit(1)
      : null;

    if (existing && existing.length > 0) {
      const [doc] = await db
        .update(documents)
        .set({
          ...document,
          updatedAt: new Date(),
        })
        .where(eq(documents.notionId, document.notionId!))
        .returning();
      return doc;
    }

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
}

export const storage = new DatabaseStorage();