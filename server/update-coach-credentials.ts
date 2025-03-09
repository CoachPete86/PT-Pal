// Generic trainer account setup utility
// Use this script to create default trainer accounts if needed

import { storage } from "./storage";
import { hashPassword } from "./auth";

async function setupDefaultTrainer() {
  try {
    const defaultTrainerEmail = "trainer@ptpal.com";
    const existingTrainer = await storage.getUserByEmail(defaultTrainerEmail);

    if (!existingTrainer) {
      console.log("Creating default trainer account...");

      const hashedPassword = await hashPassword("change_this_password");

      await storage.createUser({
        email: defaultTrainerEmail,
        username: "trainer",
        password: hashedPassword,
        fullName: "Demo Trainer",
        role: "trainer",
        subscriptionTier: "premium",
        subscriptionStatus: "active",
        status: "active",
      });

      console.log("Default trainer account created successfully");
    } else {
      console.log("Default trainer account already exists");
    }
  } catch (error) {
    console.error("Error setting up default trainer:", error);
  }
}

setupDefaultTrainer().catch(console.error);