import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const isDevelopment = process.env.NODE_ENV === "development";

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Generate a random session secret if one doesn't exist
  const sessionSecret =
    process.env.SESSION_SECRET || randomBytes(32).toString("hex");

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: app.get("env") === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  // Trust first proxy if in production
  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          console.log(`Attempting login for email: ${email}`);
          // Convert email to lowercase for case-insensitive comparison
          const normalizedEmail = email.toLowerCase();
          console.log(`Normalized email for lookup: ${normalizedEmail}`);
          const user = await storage.getUserByEmail(normalizedEmail);
          if (!user) {
            console.log("User not found during login attempt");
            return done(null, false, {
              message: "Invalid credentials - no user found with this email",
            });
          }
          const isValid = await comparePasswords(password, user.password);
          console.log(`Password validation result: ${isValid}`);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }

          // Ensure the user has all required fields
          const userWithDefaults = {
            ...user,
            status: user.status || "active",
            preferences: user.preferences || {},
          };

          return done(null, userWithDefaults);
        } catch (error) {
          console.error("Login error:", error);
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    console.log("Serializing user:", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Deserializing user:", id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log("User not found during deserialization");
        return done(null, false);
      }
      console.log("User deserialized successfully");

      // Ensure user has all required fields
      const userWithDefaults = {
        ...user,
        status: user.status || "active",
        preferences: user.preferences || {},
      };

      done(null, userWithDefaults);
    } catch (error) {
      console.error("Deserialization error:", error);
      done(error);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { email: rawEmail, password, fullName } = req.body;
      
      // Normalize email to lowercase for consistency
      const email = rawEmail.toLowerCase();
      console.log(`Registering with normalized email: ${email}`);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: "Email already registered",
          message:
            "This email is already registered. Please try logging in instead.",
        });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        username: email.split("@")[0],
        password: hashedPassword,
        fullName,
        role: "trainer",
        subscriptionTier: "free",
        subscriptionStatus: "active",
        status: "active", // Added status field here
      });

      req.login(user, (err) => {
        if (err) {
          console.error("Session error:", err);
          return res.status(500).json({ error: "Failed to create session" });
        }
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({
        error: "Failed to register user",
        message: error.message,
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (err: any, user: Express.User | false, info: any) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ error: "Internal server error" });
        }
        if (!user) {
          return res
            .status(401)
            .json({ error: info?.message || "Invalid credentials" });
        }
        req.login(user, (err) => {
          if (err) {
            console.error("Session error:", err);
            return res.status(500).json({ error: "Failed to create session" });
          }
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        });
      },
    )(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not logged in" });
    }
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return next(err);
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return next(err);
        }
        res.clearCookie("connect.sid");
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("GET /api/user - isAuthenticated:", req.isAuthenticated());
    console.log("Session:", req.session);
    console.log("User:", req.user);

    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
