import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { requirePermissions } from "../../shared/middleware/permissions.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  updateUserSchema,
  updateUserRoleSchema,
  getUserByIdSchema,
} from "./user.validation";

const userRoutes = Router();

// All routes require authentication
userRoutes.use(authenticate);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
userRoutes.get(
  "/",
  requirePermissions("user:read"),
  userController.getAllUsers,
);

userRoutes.get(
  "/:id",
  requirePermissions("user:read"),
  validate(getUserByIdSchema),
  userController.getUserById,
);

userRoutes.patch("/me", authenticate, userController.updateUser);

userRoutes.patch(
  "/:id/role",
  requirePermissions("user:update"),
  validate(updateUserRoleSchema),
  userController.updateUserRole,
);

userRoutes.delete(
  "/:id",
  requirePermissions("user:delete"),
  validate(getUserByIdSchema),
  userController.deleteUser,
);

export default userRoutes;
