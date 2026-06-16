import { Response, NextFunction } from "express";
import { AuthRequest } from "../../shared/types";
import { permissionService } from "./permission.service";
import { CreatePermissionInput, UpdatePermissionInput } from "./permission.validation";

export class PermissionController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const permissions = await permissionService.getAll();
      res.status(200).json({ success: true, data: permissions });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const permission = await permissionService.getById(id);
      res.status(200).json({ success: true, data: permission });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data: CreatePermissionInput = req.body;
      const permission = await permissionService.create(data);
      res.status(201).json({ success: true, message: "Permission created successfully", data: permission });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdatePermissionInput = req.body;
      const permission = await permissionService.update(id, data);
      res.status(200).json({ success: true, message: "Permission updated successfully", data: permission });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await permissionService.delete(id);
      res.status(200).json({ success: true, message: "Permission deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export const permissionController = new PermissionController();
