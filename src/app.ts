import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
// import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
// import 'express-async-errors';

import { config } from './config/env';
import { requestLogger } from './shared/middleware/logger.middleware';
import { errorHandler, notFoundHandler } from './shared/middleware/error.middleware';
import router from './routes';

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
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use(`/api/${config.apiVersion}`, limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
//   app.use(cookieParser());

  // Request logging
  app.use(requestLogger);

  // API routes
  app.use(`/api/${config.apiVersion}`, router);

  // Root route
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Express TypeScript Starter API',
      version: config.apiVersion,
      endpoints: {
        health: `/api/${config.apiVersion}/health`,
        auth: `/api/${config.apiVersion}/auth`,
        users: `/api/${config.apiVersion}/users`,
      },
    });
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};