import { Router } from "express";

import authRoutes from "./modules/auth/auth.route";
import permissionRoutes from "./modules/permissions/permission.route";
import postRoutes from "./modules/posts/post.route";
import roleRoutes from "./modules/roles/role.route";
import userRoutes from "./modules/users/user.route";
import productsRoutes from "./modules/product/product.route";
import categoriesRoutes from "./modules/categories/categories.route";

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
router.use("/products", productsRoutes);
router.use("/categories", categoriesRoutes);

export default router;
