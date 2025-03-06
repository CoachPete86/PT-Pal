import { storage } from "./storage";

async function updateTestUser() {
  try {
    // Update the existing user with email n@n.com
    const existingUser = await storage.getUserByEmail("n@n.com");

    if (!existingUser) {
      console.log("Test user not found");
      return;
    }

    // Update the user with all required fields
    const updatedUser = await storage.updateUser(existingUser.id, {
      role: "trainer",
      subscriptionTier: "free",
      subscriptionStatus: "active",
      status: "active",
      preferences: {
        goals: "Test goals",
        healthConditions: "None",
      },
    });

    console.log("Test user updated successfully:", updatedUser);
  } catch (error) {
    console.error("Error updating test user:", error);
  }
}

updateTestUser();
