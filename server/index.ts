import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";

const app = express();

// Configure CORS early in the middleware chain
app.use(
  cors({
    origin: true, // Allow any origin with credentials
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

// Increase limit for base64 encoded images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

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

    // Function to try binding to a port
    const tryPort = async (port: number): Promise<number> => {
      return new Promise((resolve, reject) => {
        const tempServer = server;
        
        tempServer.once("error", (err: NodeJS.ErrnoException) => {
          if (err.code === "EADDRINUSE") {
            log(`Port ${port} is in use, trying next port...`);
            tempServer.removeAllListeners("error");
            tempServer.removeAllListeners("listening");
            resolve(tryPort(port + 1));
          } else {
            reject(err);
          }
        });

        tempServer.once("listening", () => {
          log(`Server started successfully on port ${port}`);
          resolve(port);
        });

        tempServer.listen(port, "0.0.0.0");
      });
    };

    // Start server with port finding logic
    try {
      const port = await tryPort(5000);
      log(`Server is running at http://0.0.0.0:${port}`);
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
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
