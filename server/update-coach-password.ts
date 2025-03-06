import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function updateCoachPassword() {
  const hashedPassword = await hashPassword(process.env.COACH_PASSWORD!);
  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.username, "coach_pete"));
  console.log("Coach password updated successfully");
}

updateCoachPassword().catch(console.error);
