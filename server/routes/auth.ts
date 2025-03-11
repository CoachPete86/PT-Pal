
import express from "express";
import { db } from "../db";
import { hash, compare } from "bcrypt";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { SUBSCRIPTION_PRICES, SubscriptionTier } from "../stripe";

const router = express.Router();

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, subscriptionTier = "free" } = req.body;
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create new user
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      subscriptionTier,
    }).returning();
    
    // Return success without the password
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "An error occurred during registration" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Compare passwords
    const passwordMatch = await compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Set user in session
    if (req.session) {
      req.session.userId = user.id;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "An error occurred during login" });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  req.session?.destroy(() => {
    res.status(200).json({ message: "Logged out successfully" });
  });
});

export default router;
