import { type Response, type NextFunction } from "express";

import { type AuthRequest } from "../../shared/types";
import { logger } from "../../shared/utils/logger";

import { postService } from "./post.service";
import {
  type CreatePostInput,
  type UpdatePostInput,
  type PostQueryInput,
} from "./post.validation";

export class PostController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as PostQueryInput;

      const result = await postService.getAll({
        page: query.page,
        limit: query.limit,
        search: query.search,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      res.status(200).json({
        status: true,
        message: "Posts retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await postService.getById(Number(id));
      res.status(200).json({
        status: true,
        message: "Post retrieved successfully",
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreatePostInput;
      const post = await postService.create(data);
      logger.info(`Post created: ${post.title}`);
      res.status(201).json({
        status: true,
        message: "Post created successfully",
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdatePostInput;
      const post = await postService.update(Number(id), data);
      logger.info(`Post updated: ${post.title}`);
      res.status(200).json({
        status: true,
        message: "Post updated successfully",
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await postService.delete(Number(id));
      logger.info(`Post deleted: ${id}`);
      res.status(200).json({
        status: true,
        message: "Post deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
