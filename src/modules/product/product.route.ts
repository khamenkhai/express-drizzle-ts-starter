import { Router } from "express";

import { authenticate } from "../../shared/middleware/auth.middleware";
import { validate } from "../../shared/middleware/validate.middleware";

import { productController } from "./product.controller";
import {
  getAllProductsSchema,
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
} from "./product.validation";

const productsRoutes = Router();

productsRoutes.use(authenticate);

productsRoutes.get(
  "/",
  validate(getAllProductsSchema),
  productController.getAll,
);

productsRoutes.get(
  "/:id",
  validate(getProductByIdSchema),
  productController.getById,
);

productsRoutes.post(
  "/",
  validate(createProductSchema),
  productController.create,
);

productsRoutes.patch(
  "/:id",
  validate(updateProductSchema),
  productController.update,
);

productsRoutes.delete(
  "/:id",
  validate(getProductByIdSchema),
  productController.delete,
);

export default productsRoutes;
