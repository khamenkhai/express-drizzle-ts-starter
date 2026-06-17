import { type Response } from "express";

import { type AuthRequest } from "../../shared/types";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { logger } from "../../shared/utils/logger";

import { roleService } from "./role.service";
import { type CreateRoleInput, type UpdateRoleInput } from "./role.validation";

export class RoleController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const roles = await roleService.getAll();
    res.status(200).json({ success: true, data: roles });
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const role = await roleService.getById(id);
    res.status(200).json({ success: true, data: role });
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = req.body as CreateRoleInput;
    const role = await roleService.create(data);
    logger.info(`Role created: ${role.name}`);
    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdateRoleInput;
    const role = await roleService.update(id, data);
    logger.info(`Role updated: ${role?.name}`);
    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    await roleService.delete(id);
    logger.info(`Role deleted: ${id}`);
    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  });
}

export const roleController = new RoleController();
