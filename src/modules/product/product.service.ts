import { prisma } from "../../db";
import { type Product } from "../../generated/client/client";
import { type PaginatedResponse } from "../../shared/types";
import { NotFoundError } from "../../shared/types/error";

export class ProductService {
  async getAll(params: {
    page: number;
    limit: number;
  }): Promise<PaginatedResponse<unknown>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count(),
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

  async getById(id: number): Promise<Product> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }

  async create(data: { name: string }): Promise<Product> {
    return prisma.product.create({ data });
  }

  async update(id: number, data: { name?: string }): Promise<Product> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Product not found");
    return prisma.product.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Product not found");
    await prisma.product.delete({ where: { id } });
  }
}

export const productService = new ProductService();
