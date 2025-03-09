
// Generic password reset utility
// This script can be used to reset a user's password

import { storage } from "./storage";
import { hashPassword } from "./auth";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetUserPassword() {
  try {
    const email = await new Promise(resolve => {
      rl.question("Enter user email to reset password: ", resolve);
    });
    
    const user = await storage.getUserByEmail(email as string);
    
    if (!user) {
      console.log("User not found with that email");
      rl.close();
      return;
    }
    
    const newPassword = await new Promise(resolve => {
      rl.question("Enter new password: ", resolve);
    });
    
    const hashedPassword = await hashPassword(newPassword as string);
    
    await storage.updateUser(user.id, {
      password: hashedPassword
    });
    
    console.log("Password updated successfully");
    rl.close();
  } catch (error) {
    console.error("Error resetting password:", error);
    rl.close();
  }
}

resetUserPassword().catch(console.error);
