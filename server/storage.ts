import { users, messages, bookings } from "@shared/schema";
import type { User, InsertUser, Message, Booking } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMessages(userId: number): Promise<Message[]>;
  createMessage(message: Partial<Message>): Promise<Message>;
  getBookings(userId: number): Promise<Booking[]>;
  createBooking(booking: Partial<Booking>): Promise<Booking>;
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private bookings: Map<number, Booking>;
  private currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.bookings = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, role: "client" };
    this.users.set(id, user);
    return user;
  }

  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (msg) => msg.senderId === userId || msg.recipientId === userId,
    );
  }

  async createMessage(message: Partial<Message>): Promise<Message> {
    const id = this.currentId++;
    const newMessage: Message = {
      id,
      senderId: message.senderId!,
      recipientId: message.recipientId!,
      content: message.content!,
      timestamp: new Date(),
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId,
    );
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    const id = this.currentId++;
    const newBooking: Booking = {
      id,
      userId: booking.userId!,
      date: booking.date!,
      status: booking.status || "pending",
      notes: booking.notes || "",
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }
}

export const storage = new MemStorage();
