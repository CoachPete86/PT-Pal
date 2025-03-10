import { hashPassword } from "./auth";
import { storage } from "./storage";

async function createCoachUser() {
  try {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail("coachpete@86.com");
    if (existingUser) {
      console.log("Coach user already exists:", existingUser);
      return;
    }

    const hashedPassword = await hashPassword("123456789");
    const user = await storage.createUser({
      email: "coachpete@86.com",
      username: "coachpete",
      password: hashedPassword,
      role: "trainer",
      subscriptionTier: "professional",
      subscriptionStatus: "active",
      status: "active",
      fullName: "Coach Pete",
      preferences: {
        goals: ["Help clients achieve their fitness goals"],
        healthConditions: ["None"],
      },
    });
    console.log("Coach user created successfully:", user);
  } catch (error) {
    console.error("Error creating coach user:", error);
  }
}

createCoachUser();