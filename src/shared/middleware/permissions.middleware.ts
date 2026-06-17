import { type Response, type NextFunction } from "express";

import { type AuthRequest } from "../types";
import { ForbiddenError, UnauthorizedError } from "../types/error";

export const requirePermissions = (...requiredPermissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      if (!requiredPermissions.length) {
        return next();
      }

      const userPermissions = req.user.permissions ?? [];

      const missingPermissions = requiredPermissions.filter(
        (required) => !userPermissions.includes(required),
      );

      if (missingPermissions.length > 0) {
        throw new ForbiddenError(
          `Missing permissions: ${missingPermissions.join(", ")}`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
