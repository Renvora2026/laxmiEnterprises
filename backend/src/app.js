import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import apiRouter from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorMiddleware.js";
import { ApiResponse } from "./utils/apiResponse.js";

dotenv.config();

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      const isVercelDomain = origin && /^https:\/\/[a-zA-Z0-9_\-.]+\.vercel\.app$/.test(origin);
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin) || isVercelDomain) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: origin not allowed"));
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
}

// Request parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root health check endpoints
const healthCheckHandler = (req, res) => {
  return ApiResponse.success(
    res,
    {
      status: "online",
      database: "MySQL (TiDB Cloud / Hostinger)",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    "Laxmi Enterprises ERP Backend Service is running smoothly"
  );
};
app.get("/api/health", healthCheckHandler);
app.get("/health", healthCheckHandler);

// Mount API Router across all common path variations (/api/v1, /api, and /)
app.use("/api/v1", apiRouter);
app.use("/api", apiRouter);
app.use("/", apiRouter);

// 404 & Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
