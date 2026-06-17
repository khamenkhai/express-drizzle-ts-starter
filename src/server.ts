import { createApp } from "./app";
import { config } from "./config/env";
import { logger } from "./shared/utils/logger";

const startServer = () => {
  try {
    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(
        `🚀 Server running in ${config.env} mode on port ${config.port}`,
      );
      logger.info(
        `📍 API URL: http://localhost:${config.port}/api/${config.apiVersion}`,
      );
      logger.info(
        `📊 Health check: http://localhost:${config.port}/api/${config.apiVersion}/health`,
      );
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(() => {
        logger.info("Server closed. Process terminating...");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason: Error) => {
      logger.error("Unhandled Rejection:", reason);
      throw reason;
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

void startServer();
