import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/authorize.middleware";
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
userRoutes.get("/", authorize("superadmin", "admin"), userController.getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
userRoutes.get(
  "/:id",
  authorize("superadmin", "admin"),
  validate(getUserByIdSchema),
  userController.getUserById,
);

/**
 * @route   PATCH /api/v1/users/me
 * @desc    Update current user
 * @access  Private
 */
userRoutes.patch("/me", authenticate,userController.updateUser);

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 */
userRoutes.patch(
  "/:id/role",
  authorize("superadmin", "admin"),
  validate(updateUserRoleSchema),
  userController.updateUserRole,
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
userRoutes.delete(
  "/:id",
  authorize("superadmin", "admin"),
  validate(getUserByIdSchema),
  userController.deleteUser,
);

export default userRoutes;
