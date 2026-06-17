import { Router } from "express";

import { authenticate } from "../../shared/middleware/auth.middleware";
import { requirePermissions } from "../../shared/middleware/permissions.middleware";
import { validate } from "../../shared/middleware/validate.middleware";

import { roleController } from "./role.controller";
import {
  createRoleSchema,
  updateRoleSchema,
  getRoleByIdSchema,
} from "./role.validation";

const roleRoutes = Router();

roleRoutes.use(authenticate);

roleRoutes.get(
  "/",
  requirePermissions("role:read"),
  roleController.getAll,
);

roleRoutes.get(
  "/:id",
  requirePermissions("role:read"),
  validate(getRoleByIdSchema),
  roleController.getById,
);

roleRoutes.post(
  "/",
  requirePermissions("role:create"),
  validate(createRoleSchema),
  roleController.create,
);

roleRoutes.patch(
  "/:id",
  requirePermissions("role:update"),
  validate(updateRoleSchema),
  roleController.update,
);

roleRoutes.delete(
  "/:id",
  requirePermissions("role:delete"),
  validate(getRoleByIdSchema),
  roleController.delete,
);

export default roleRoutes;
