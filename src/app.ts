import cors from "cors";
import express, { type Application } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { config } from "./config/env";
import router from "./routes";
import {
  errorHandler,
  notFoundHandler,
} from "./shared/middleware/error.middleware";
import { requestLogger } from "./shared/middleware/logger.middleware";

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (config.cors.origins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    }),
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(`/api/${config.apiVersion}`, limiter);

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Request logging
  app.use(requestLogger);

  // API routes
  app.use(`/api/${config.apiVersion}`, router);

  // Root route
  app.get("/", (req, res) => {
    res.json({
      status: true,
      message: "Express TypeScript Starter API",
      data: {
        version: config.apiVersion,
        endpoints: {
          health: `/api/${config.apiVersion}/health`,
          auth: `/api/${config.apiVersion}/auth`,
          users: `/api/${config.apiVersion}/users`,
          roles: `/api/${config.apiVersion}/roles`,
          permissions: `/api/${config.apiVersion}/permissions`,
          posts: `/api/${config.apiVersion}/posts`,
        },
      },
    });
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
