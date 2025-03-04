import { hashPassword } from "./auth";
import { storage } from "./storage";

async function createTestUser() {
  try {
    const hashedPassword = await hashPassword("12345678");
    const user = await storage.createUser({
      email: "n@n.com",
      username: "n",
      password: hashedPassword,
      role: "trainer",
      subscriptionTier: "free",
      subscriptionStatus: "active",
      status: "active", 
      fullName: "Test User",
      preferences: {
        goals: "Test goals",
        healthConditions: "None",
      }
    });
    console.log("Test user created successfully:", user);
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}

createTestUser();