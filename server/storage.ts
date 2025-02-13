import { users, messages, bookings, fitnessJourney, documents, trainerClients, workoutPlans } from "@shared/schema";
import type { 
  User, InsertUser, Message, Booking, FitnessJourney, 
  InsertFitnessJourney, Document, InsertDocument,
  TrainerClient, InsertTrainerClient, WorkoutPlan, InsertWorkoutPlan 
} from "@shared/schema";
import { db } from "./db";
import { eq, or, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Trainer-Client relationship
  getTrainerClients(trainerId: number): Promise<TrainerClient[]>;
  getClientTrainers(clientId: number): Promise<TrainerClient[]>;
  addTrainerClient(relationship: InsertTrainerClient): Promise<TrainerClient>;

  // Workout Plans
  getWorkoutPlans(trainerId: number, clientId?: number): Promise<WorkoutPlan[]>;
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;

  // Messages
  getMessages(userId: number): Promise<Message[]>;
  createMessage(message: Partial<Message>): Promise<Message>;

  // Bookings
  getBookings(userId: number, role: "trainer" | "client"): Promise<Booking[]>;
  createBooking(booking: Partial<Booking>): Promise<Booking>;

  // Fitness Journey
  getFitnessJourney(clientId: number): Promise<FitnessJourney[]>;
  createFitnessJourneyEntry(entry: InsertFitnessJourney): Promise<FitnessJourney>;

  // Documents
  getDocuments(trainerId: number, clientId?: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, trainerId: number, document: Partial<InsertDocument>): Promise<Document>;

  sessionStore: session.Store;
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

  // Trainer-Client Relationship
  async getTrainerClients(trainerId: number): Promise<TrainerClient[]> {
    return db
      .select()
      .from(trainerClients)
      .where(eq(trainerClients.trainerId, trainerId))
      .orderBy(desc(trainerClients.startDate));
  }

  async getClientTrainers(clientId: number): Promise<TrainerClient[]> {
    return db
      .select()
      .from(trainerClients)
      .where(eq(trainerClients.clientId, clientId))
      .orderBy(desc(trainerClients.startDate));
  }

  async addTrainerClient(relationship: InsertTrainerClient): Promise<TrainerClient> {
    const [result] = await db
      .insert(trainerClients)
      .values(relationship)
      .returning();
    return result;
  }

  // Workout Plans
  async getWorkoutPlans(trainerId: number, clientId?: number): Promise<WorkoutPlan[]> {
    let query = db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.trainerId, trainerId));

    if (clientId) {
      query = query.where(eq(workoutPlans.clientId, clientId));
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

  // Messages
  async getMessages(userId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.recipientId, userId)
        )
      )
      .orderBy(desc(messages.timestamp));
  }

  async createMessage(message: Partial<Message>): Promise<Message> {
    if (!message.content || !message.senderId || !message.recipientId) {
      throw new Error("Missing required message fields");
    }

    const [newMessage] = await db
      .insert(messages)
      .values({
        content: message.content,
        senderId: message.senderId,
        recipientId: message.recipientId,
        timestamp: new Date(),
        isRead: false
      })
      .returning();
    return newMessage;
  }

  // Bookings
  async getBookings(userId: number, role: "trainer" | "client"): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(
        role === "trainer" 
          ? eq(bookings.trainerId, userId)
          : eq(bookings.clientId, userId)
      )
      .orderBy(desc(bookings.date));
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    if (!booking.trainerId || !booking.clientId || !booking.date) {
      throw new Error("Missing required booking fields");
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        trainerId: booking.trainerId,
        clientId: booking.clientId,
        date: new Date(booking.date),
        status: booking.status || "pending",
        notes: booking.notes || null
      })
      .returning();
    return newBooking;
  }

  // Fitness Journey
  async getFitnessJourney(clientId: number): Promise<FitnessJourney[]> {
    return db
      .select()
      .from(fitnessJourney)
      .where(eq(fitnessJourney.clientId, clientId))
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
  async getDocuments(trainerId: number, clientId?: number): Promise<Document[]> {
    let query = db
      .select()
      .from(documents)
      .where(eq(documents.trainerId, trainerId));

    if (clientId) {
      query = query.where(eq(documents.clientId, clientId));
    }

    return query.orderBy(desc(documents.updatedAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    if (!document.content || !document.title || !document.trainerId) {
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

  async updateDocument(id: number, trainerId: number, document: Partial<InsertDocument>): Promise<Document> {
    const [existingDoc] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.id, id),
          eq(documents.trainerId, trainerId)
        )
      );

    if (!existingDoc) {
      throw new Error("Document not found or access denied");
    }

    const [updatedDoc] = await db
      .update(documents)
      .set({
        ...document,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();
    return updatedDoc;
  }
}

export const storage = new DatabaseStorage();