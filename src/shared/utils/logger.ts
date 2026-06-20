import winston from "winston";

import { config } from "../../config/env";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const isDevelopment = config.env === "development";
  return isDevelopment ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const timestampFormat = winston.format.timestamp({
  format: "YYYY-MM-DD HH:mm:ss:ms",
});

const consoleFormat = winston.format.combine(
  timestampFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info: winston.Logform.TransformableInfo) =>
      `${String(info.timestamp)} ${info.level}: ${String(info.message)}`,
  ),
);

const fileFormat = winston.format.combine(
  timestampFormat,
  winston.format.printf(
    (info: winston.Logform.TransformableInfo) =>
      `${String(info.timestamp)} ${info.level}: ${String(info.message)}`,
  ),
);

const transports = [
  new winston.transports.Console({ format: consoleFormat }),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    format: fileFormat,
  }),
  new winston.transports.File({
    filename: "logs/all.log",
    format: fileFormat,
  }),
];

export const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});
