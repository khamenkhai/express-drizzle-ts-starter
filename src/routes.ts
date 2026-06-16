import { Router } from "express";
import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/users/user.route";
import roleRoutes from "./modules/roles/role.route";
import permissionRoutes from "./modules/permissions/permission.route";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Module routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);

export default router;
