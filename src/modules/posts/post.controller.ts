import { type Response } from "express";
import { type AuthRequest } from "../../shared/types";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { logger } from "../../shared/utils/logger";
import { postService } from "./post.service";
import { type CreatePostInput, type UpdatePostInput } from "./post.validation";

export class PostController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await postService.getAll({ page, limit });

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const post = await postService.getById(Number(id));

    res.status(200).json({
      success: true,
      data: post,
    });
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = req.body as CreatePostInput;
    const post = await postService.create(data);

    logger.info(`Post created: ${post.title}`);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdatePostInput;
    const post = await postService.update(Number(id), data);

    logger.info(`Post updated: ${post.title}`);

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    await postService.delete(Number(id));

    logger.info(`Post deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  });
}

export const postController = new PostController();
