import { type Response, type NextFunction } from "express";

import { type AuthRequest } from "../../shared/types";
import { logger } from "../../shared/utils/logger";

import { userService } from "./user.service";
import { type UpdateUserInput, type UpdateUserRoleInput } from "./user.validation";

export class UserController {
  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const userId = Number(id);

      if (isNaN(userId)) {
        res.status(400).json({ message: "Invalid User ID format" });
        return;
      }

      const user = await userService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const userId = Number(req.user.id);

      if (isNaN(userId)) {
        res.status(400).json({ message: "Invalid User ID format" });
        return;
      }

      const data = req.body as UpdateUserInput;

      const user = await userService.updateUser(userId, {
        name: data.name,
      });

      logger.info(`User updated: ${user.email}`);

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const { id } = req.params;
      const userId = Number(id);
      const { roleId } = req.body as UpdateUserRoleInput;

      const user = await userService.updateUserRole(userId, roleId, req.user.id);

      logger.info(`User role updated: ${user.email} -> ${roleId}`);

      res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const { id } = req.params;
      await userService.deleteUser(Number(id), req.user.id);

      logger.info(`User deleted: ${id}`);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
