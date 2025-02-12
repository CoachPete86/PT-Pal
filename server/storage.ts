import { users, messages, bookings, fitnessJourney, documents } from "@shared/schema";
import type { User, InsertUser, Message, Booking, FitnessJourney, InsertFitnessJourney, Document, InsertDocument } from "@shared/schema";
import { db } from "./db";
import { eq, or, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMessages(userId: number): Promise<Message[]>;
  createMessage(message: Partial<Message>): Promise<Message>;
  getBookings(userId: number): Promise<Booking[]>;
  createBooking(booking: Partial<Booking>): Promise<Booking>;
  getFitnessJourney(userId: number): Promise<FitnessJourney[]>;
  createFitnessJourneyEntry(entry: InsertFitnessJourney): Promise<FitnessJourney>;
  getDocuments(userId: number): Promise<Document[]>;
  upsertDocument(document: InsertDocument): Promise<Document>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, userId: number, document: Partial<InsertDocument>): Promise<Document>;
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

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      role: "client"
    }).returning();
    return user;
  }

  async getMessages(userId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.recipientId, userId)
        )
      );
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
        timestamp: new Date()
      })
      .returning();
    return newMessage;
  }

  async getBookings(userId: number): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId));
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    if (!booking.userId || !booking.date) {
      throw new Error("Missing required booking fields");
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        userId: booking.userId,
        date: new Date(booking.date),
        status: booking.status || "pending",
        notes: booking.notes || null
      })
      .returning();
    return newBooking;
  }

  async getFitnessJourney(userId: number): Promise<FitnessJourney[]> {
    return db
      .select()
      .from(fitnessJourney)
      .where(eq(fitnessJourney.userId, userId))
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

  async getDocuments(userId: number): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.updatedAt));
  }

  async upsertDocument(document: InsertDocument): Promise<Document> {
    if (!document.content || !document.title || !document.userId) {
      throw new Error("Missing required document fields");
    }

    let existingDoc: Document | undefined;
    if (document.notionId) {
      [existingDoc] = await db
        .select()
        .from(documents)
        .where(eq(documents.notionId, document.notionId));
    }

    if (existingDoc) {
      const [updatedDoc] = await db
        .update(documents)
        .set({
          ...document,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, existingDoc.id))
        .returning();
      return updatedDoc;
    } else {
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
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    if (!document.content || !document.title || !document.userId) {
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

  async updateDocument(id: number, userId: number, document: Partial<InsertDocument>): Promise<Document> {
    const [existingDoc] = await db
      .select()
      .from(documents)
      .where(
        eq(documents.id, id) &&
        eq(documents.userId, userId)
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