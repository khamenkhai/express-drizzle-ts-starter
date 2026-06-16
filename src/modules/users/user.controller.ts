import { Response, NextFunction } from "express";
import { userService } from "./user.service";
import { AuthRequest } from "../../shared/types";
import { UpdateUserInput, UpdateUserRoleInput } from "./user.validation";
import { logger } from "../../shared/utils/logger";

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

  async getUserById(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const { id } = req.params;

      const userId = Number(id);

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
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

  async updateUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const userId = Number(req.user.id);

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }

      const data: UpdateUserInput = req.body;

      const user = await userService.updateUser(userId, {
        name : data.name
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
      const { roleId }: UpdateUserRoleInput = req.body;

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
