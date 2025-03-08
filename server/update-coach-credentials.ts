import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

async function updateCoachCredentials() {
  try {
    console.log("Updating coach credentials...");
    
    // Hash the password
    const hashedPassword = await hashPassword("123456789");
    
    // Check if the user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "Coachpete@86.com"))
      .limit(1);
    
    if (existingUser.length > 0) {
      // Update existing user
      await db
        .update(users)
        .set({
          email: "Coachpete@86.com",
          username: "CoachPete",
          password: hashedPassword,
          fullName: "Coach Pete Ryan",
          role: "trainer",
          subscriptionTier: "premium",
          subscriptionStatus: "active",
          onboardingStatus: "completed",
        })
        .where(eq(users.id, existingUser[0].id));
      
      console.log(`Updated coach account with ID: ${existingUser[0].id}`);
    } else {
      // Create new user
      const result = await db.insert(users).values({
        email: "Coachpete@86.com",
        username: "CoachPete",
        password: hashedPassword,
        fullName: "Coach Pete Ryan",
        role: "trainer",
        subscriptionTier: "premium",
        subscriptionStatus: "active",
        onboardingStatus: "completed",
        createdAt: new Date(),
        lastActive: new Date(),
        status: "active",
      }).returning({ id: users.id });
      
      console.log(`Created new coach account with ID: ${result[0].id}`);
    }
    
    console.log("Coach credentials updated successfully!");
  } catch (error) {
    console.error("Error updating coach credentials:", error);
  }
}

updateCoachCredentials().catch(console.error);