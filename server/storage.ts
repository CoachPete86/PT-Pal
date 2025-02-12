import { users, messages, bookings } from "@shared/schema";
import type { User, InsertUser, Message, Booking } from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";
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
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: "session",
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: "client",
      })
      .returning();
    return user;
  }

  async getMessages(userId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        or(eq(messages.senderId, userId), eq(messages.recipientId, userId)),
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
        timestamp: new Date(),
      })
      .returning();
    return newMessage;
  }

  async getBookings(userId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    if (!booking.userId || !booking.date) {
      throw new Error("Missing required booking fields");
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        userId: booking.userId,
        date: booking.date,
        status: booking.status || "pending",
        notes: booking.notes || null,
      })
      .returning();
    return newBooking;
  }
}

export const storage = new DatabaseStorage();
