import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/types";
import { roleService } from "./role.service";
import { CreateRoleInput, UpdateRoleInput } from "./role.validation";
import { logger } from "../../shared/utils/logger";

export class RoleController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const roles = await roleService.getAll();
      res.status(200).json({ success: true, data: roles });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const role = await roleService.getById(id);
      res.status(200).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data: CreateRoleInput = req.body;
      const role = await roleService.create(data);
      logger.info(`Role created: ${role.name}`);
      res.status(201).json({ success: true, message: "Role created successfully", data: role });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateRoleInput = req.body;
      const role = await roleService.update(id, data);
      logger.info(`Role updated: ${role?.name}`);
      res.status(200).json({ success: true, message: "Role updated successfully", data: role });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await roleService.delete(id);
      logger.info(`Role deleted: ${id}`);
      res.status(200).json({ success: true, message: "Role deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export const roleController = new RoleController();
