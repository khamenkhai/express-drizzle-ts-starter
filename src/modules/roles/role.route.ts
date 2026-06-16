import { Router } from "express";
import { roleController } from "./role.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/authorize.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  createRoleSchema,
  updateRoleSchema,
  getRoleByIdSchema,
} from "./role.validation";

const roleRoutes = Router();

roleRoutes.use(authenticate);

roleRoutes.get("/", authorize("superadmin", "admin"), roleController.getAll);

roleRoutes.get(
  "/:id",
  authorize("superadmin", "admin"),
  validate(getRoleByIdSchema),
  roleController.getById,
);

roleRoutes.post(
  "/",
  authorize("superadmin"),
  validate(createRoleSchema),
  roleController.create,
);

roleRoutes.patch(
  "/:id",
  authorize("superadmin"),
  validate(updateRoleSchema),
  roleController.update,
);

roleRoutes.delete(
  "/:id",
  authorize("superadmin"),
  validate(getRoleByIdSchema),
  roleController.delete,
);

export default roleRoutes;
