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
      subscription_tier: "free",
      subscription_status: "active",
      full_name: "Test User",
      created_at: new Date(),
      last_active: new Date(),
      preferences: {},
      onboarding_status: "completed"
    });
    console.log("Test user created successfully:", user);
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}

createTestUser();
