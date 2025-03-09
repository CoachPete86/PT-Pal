import { storage } from "./storage";

export async function setupAdminUser() {
  try {
    const adminExists = await storage.getUserByEmail("admin@ptpal.com");

    if (!adminExists) {
      console.log("Creating default admin user...");
      // Create an admin user with default credentials
      // In production, you would want to use environment variables for these values
      await storage.createUser({
        email: "admin@ptpal.com",
        username: "admin",
        password: "CHANGE_THIS_PASSWORD", // Should be changed immediately after first login
        fullName: "System Administrator",
        role: "admin",
        subscriptionTier: "enterprise",
        subscriptionStatus: "active",
        status: "active",
      });
      console.log("Default admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error setting up admin user:", error);
  }
}