import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";
import session from "express-session"; // Added for session management
import authRoutes from "./routes/auth"; // Added for authentication routes


const app = express();

// Configure CORS early in the middleware chain
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any origin while in development
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

// Increase limit for base64 encoded images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Configure session middleware (added based on common practice)
// Ensure we have a proper session secret in production
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  console.error("WARNING: SESSION_SECRET not set in production environment!");
  console.error("This is a security risk. Please set SESSION_SECRET environment variable.");
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? 
      `temp_secret_${Date.now()}` : "development_secret"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);


app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Mount authentication routes
app.use("/api/auth", authRoutes);


const startServer = async () => {
  try {
    // Register routes and get HTTP server
    const server = registerRoutes(app);

    // Set up error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Error:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ error: message });
    });

    // Set up Vite or static serving based on environment
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Try to bind to port 5000 for Replit workflow compatibility
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port 5000 is in use, using port 5002 instead...`);
        server.listen(5002, "0.0.0.0");
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });

    server.on('listening', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 5000;
      log(`Server started successfully on port ${port}`);
      log(`Server is running at http://0.0.0.0:${port}`);
    });

    server.listen(5000, "0.0.0.0");
  } catch (error) {
    console.error("Server initialization failed:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle graceful shutdown
process.on("SIGTERM", () => {
  log("SIGTERM signal received: closing HTTP server");
  let server;
  try {
    server = registerRoutes(app);
  } catch (error) {
    console.error("Error getting server instance during shutdown:", error);
    process.exit(1);
  }
  if (server) {
    server.close(() => {
      log("HTTP server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});