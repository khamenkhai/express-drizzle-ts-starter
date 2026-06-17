import { prisma } from "../../db";
import { type Post } from "../../db/generated/client/client";
import { type PaginatedResponse } from "../../shared/types";
import { NotFoundError } from "../../shared/types/error";

export class PostService {
  async getAll(params: {
    page: number;
    limit: number;
  }): Promise<PaginatedResponse<unknown>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.post.count(),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number): Promise<Post> {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundError("Post not found");
    return post;
  }

  async create(data: { title: string; content: string }): Promise<Post> {
    return prisma.post.create({ data });
  }

  async update(
    id: number,
    data: { title?: string; content?: string },
  ): Promise<Post> {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Post not found");

    return prisma.post.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Post not found");

    await prisma.post.delete({ where: { id } });
  }
}

export const postService = new PostService();
