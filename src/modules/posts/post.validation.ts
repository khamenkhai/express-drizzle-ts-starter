import { z } from "zod";

import { type PaginationParams } from "../../shared/types";

export const getAllPostsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    sortBy: z.enum(["id", "title", "createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
  }),
  params: z.object({
    id: z.coerce.number({
      invalid_type_error: "ID must be a valid number",
    }),
  }),
});

export const getPostByIdSchema = z.object({
  params: z.object({
    id: z.coerce.number({
      invalid_type_error: "ID must be a valid number",
    }),
  }),
});

export type PostQueryInput = PaginationParams;
export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
