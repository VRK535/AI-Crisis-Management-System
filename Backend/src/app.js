import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import apiRoutes from "./routes.js";
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

// Security headers
app.use(helmet());

// Flexible CORS setup so web & mobile (React Native / Flutter / Vite) can connect easily
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = [
  clientUrl,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8081",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Parse incoming requests
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI-Based Crisis Management System API is running",
    features: [
      "Crisis-Based Safe Location Guidance",
      "Personalized RAG Chatbot",
      "Offline Peer-to-Peer Mesh Sync",
      "AI Rescue Triage & Incident Reporting",
    ],
    timestamp: new Date().toISOString(),
  });
});

// API v1 routes
app.use("/api/v1", apiRoutes);

// Handle unknown routes
app.use(notFoundMiddleware);

// Centralized error handler (must be last)
app.use(errorMiddleware);

export default app;