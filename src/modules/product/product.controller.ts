import { type Response, type NextFunction } from "express";

import { type AuthRequest } from "../../shared/types";
import { logger } from "../../shared/utils/logger";

import { productService } from "./product.service";
import { type CreateProductInput, type UpdateProductInput } from "./product.validation";

export class ProductController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await productService.getAll({ page, limit });

      res.status(200).json({
        status: true,
        message: "Products retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.getById(Number(id));
      res.status(200).json({ status: true, message: "Product retrieved successfully", data: product });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateProductInput;
      const product = await productService.create(data);
      logger.info("Product created: " + product.name);
      res.status(201).json({
        status: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateProductInput;
      const product = await productService.update(Number(id), data);
      logger.info("Product updated: " + product.name);
      res.status(200).json({
        status: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await productService.delete(Number(id));
      logger.info("Product deleted: " + id);
      res.status(200).json({
        status: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
