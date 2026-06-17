import { type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";

import { config } from "../../config/env";
import { AppError } from "../types/error";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log error
  logger.error(`Error: ${err.message}`, {
    error: err,
    path: req.path,
    method: req.method,
  });

  // Zod validation error
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      // ...(config.env === 'development' && { stack: err.stack }),
    });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired",
    });
    return;
  }

  // Default to 500 server error
  res.status(500).json({
    success: false,
    message: config.env === "production" ? "Something went wrong" : err.message,
    ...(config.env === "development" && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
