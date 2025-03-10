import { hashPassword } from "./auth";
import { storage } from "./storage";

async function updateCoachPassword() {
  try {
    // Get the user by email
    const user = await storage.getUserByEmail("coachpete@86.com");
    if (!user) {
      console.log("Coach user not found");
      return;
    }

    console.log("Found user:", user);

    // Hash the new password
    const hashedPassword = await hashPassword("123456789");
    
    // Update the user's password
    const updatedUser = await storage.updateUser(user.id, {
      password: hashedPassword
    });

    console.log("Coach password updated successfully:", {
      id: updatedUser.id,
      email: updatedUser.email,
      passwordUpdated: true,
    });
  } catch (error) {
    console.error("Error updating coach password:", error);
  }
}

updateCoachPassword();