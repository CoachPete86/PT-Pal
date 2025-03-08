import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function fixCoachEmail() {
  try {
    console.log("Fixing coach email case sensitivity...");
    
    // Check if the user exists with original capitalization
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "Coachpete@86.com"))
      .limit(1);
    
    if (existingUser.length > 0) {
      // Update to lowercase email
      await db
        .update(users)
        .set({
          email: "coachpete@86.com",
        })
        .where(eq(users.id, existingUser[0].id));
      
      console.log(`Updated coach email for ID: ${existingUser[0].id}`);
      console.log("Coach email fixed successfully!");
    } else {
      console.log("Coach account not found with email 'Coachpete@86.com'");
      
      // Try to find by username as fallback
      const userByUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, "CoachPete"))
        .limit(1);
        
      if (userByUsername.length > 0) {
        console.log(`Found coach by username, ID: ${userByUsername[0].id}, current email: ${userByUsername[0].email}`);
        
        // Update email to lowercase version
        await db
          .update(users)
          .set({
            email: "coachpete@86.com",
          })
          .where(eq(users.id, userByUsername[0].id));
          
        console.log(`Updated coach email for ID: ${userByUsername[0].id}`);
        console.log("Coach email fixed successfully!");
      } else {
        console.log("Coach account not found by username 'CoachPete' either");
      }
    }
  } catch (error) {
    console.error("Error fixing coach email:", error);
  }
}

fixCoachEmail().catch(console.error);