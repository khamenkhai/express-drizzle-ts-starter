import { Router } from "express";
import { permissionController } from "./permission.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { requirePermissions } from "../../shared/middleware/permissions.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  createPermissionSchema,
  updatePermissionSchema,
  getPermissionByIdSchema,
} from "./permission.validation";

const permissionRoutes = Router();

permissionRoutes.use(authenticate);

permissionRoutes.get(
  "/",
  requirePermissions("permission:read"),
  permissionController.getAll,
);

permissionRoutes.get(
  "/:id",
  requirePermissions("permission:read"),
  validate(getPermissionByIdSchema),
  permissionController.getById,
);

permissionRoutes.post(
  "/",
  requirePermissions("permission:create"),
  validate(createPermissionSchema),
  permissionController.create,
);

permissionRoutes.patch(
  "/:id",
  requirePermissions("permission:update"),
  validate(updatePermissionSchema),
  permissionController.update,
);

permissionRoutes.delete(
  "/:id",
  requirePermissions("permission:delete"),
  validate(getPermissionByIdSchema),
  permissionController.delete,
);

export default permissionRoutes;
