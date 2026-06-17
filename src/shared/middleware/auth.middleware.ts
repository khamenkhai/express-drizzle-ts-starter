import { type Response, type NextFunction } from "express";

import { type AuthRequest } from "../types";
import { UnauthorizedError } from "../types/error";
import { verifyAccessToken } from "../utils/jwt.utils";

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7);

    // Verify token
    const payload = verifyAccessToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};
