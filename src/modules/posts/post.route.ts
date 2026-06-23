import { Router } from "express";

import { authenticate } from "../../shared/middleware/auth.middleware";
import { validate } from "../../shared/middleware/validate.middleware";

import { postController } from "./post.controller";
import {
  getAllPostsSchema,
  createPostSchema,
  updatePostSchema,
  getPostByIdSchema,
} from "./post.validation";

const postRoutes = Router();

postRoutes.use(authenticate);

postRoutes.get("/", validate(getAllPostsSchema), postController.getAll);

postRoutes.get("/:id", validate(getPostByIdSchema), postController.getById);

postRoutes.post("/", validate(createPostSchema), postController.create);

postRoutes.patch("/:id", validate(updatePostSchema), postController.update);

postRoutes.delete("/:id", validate(getPostByIdSchema), postController.delete);

export default postRoutes;
