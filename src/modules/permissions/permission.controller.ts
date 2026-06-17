import { type Response } from "express";

import { type AuthRequest } from "../../shared/types";
import { asyncHandler } from "../../shared/utils/asyncHandler";

import { permissionService } from "./permission.service";
import {
  type CreatePermissionInput,
  type UpdatePermissionInput,
} from "./permission.validation";

export class PermissionController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const permissions = await permissionService.getAll();
    res.status(200).json({ success: true, data: permissions });
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const permission = await permissionService.getById(id);
    res.status(200).json({ success: true, data: permission });
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = req.body as CreatePermissionInput;
    const permission = await permissionService.create(data);
    res.status(201).json({
      success: true,
      message: "Permission created successfully",
      data: permission,
    });
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdatePermissionInput;
    const permission = await permissionService.update(id, data);
    res.status(200).json({
      success: true,
      message: "Permission updated successfully",
      data: permission,
    });
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    await permissionService.delete(id);
    res.status(200).json({
      success: true,
      message: "Permission deleted successfully",
    });
  });
}

export const permissionController = new PermissionController();
