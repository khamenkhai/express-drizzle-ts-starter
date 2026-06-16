import { Router } from "express";
import { permissionController } from "./permission.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/authorize.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  createPermissionSchema,
  updatePermissionSchema,
  getPermissionByIdSchema,
} from "./permission.validation";

const permissionRoutes = Router();

permissionRoutes.use(authenticate);

permissionRoutes.get("/", authorize("superadmin", "admin"), permissionController.getAll);

permissionRoutes.get(
  "/:id",
  authorize("superadmin", "admin"),
  validate(getPermissionByIdSchema),
  permissionController.getById,
);

permissionRoutes.post(
  "/",
  authorize("superadmin"),
  validate(createPermissionSchema),
  permissionController.create,
);

permissionRoutes.patch(
  "/:id",
  authorize("superadmin"),
  validate(updatePermissionSchema),
  permissionController.update,
);

permissionRoutes.delete(
  "/:id",
  authorize("superadmin"),
  validate(getPermissionByIdSchema),
  permissionController.delete,
);

export default permissionRoutes;
