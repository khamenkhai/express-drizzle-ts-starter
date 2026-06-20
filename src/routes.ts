import { Router } from "express";

import authRoutes from "./modules/auth/auth.route";
import permissionRoutes from "./modules/permissions/permission.route";
import postRoutes from "./modules/posts/post.route";
import roleRoutes from "./modules/roles/role.route";
import uploadRoutes from "./modules/uploads/upload.route";
import userRoutes from "./modules/users/user.route";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: true,
    message: "Server is running",
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

// Module routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);
router.use("/posts", postRoutes);
router.use("/uploads", uploadRoutes);

export default router;
