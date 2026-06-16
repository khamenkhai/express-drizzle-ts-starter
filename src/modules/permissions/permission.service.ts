import { prisma } from "../../db";
import { ConflictError, NotFoundError } from "../../shared/types/error";

export class PermissionService {
  async getAll() {
    return prisma.permission.findMany({
      orderBy: { permissionName: "asc" },
    });
  }

  async getById(id: string) {
    const permission = await prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new NotFoundError("Permission not found");
    return permission;
  }

  async create(data: { permissionName: string; description?: string | null }) {
    const existing = await prisma.permission.findUnique({
      where: { permissionName: data.permissionName },
    });
    if (existing) throw new ConflictError("Permission with this name already exists");

    return prisma.permission.create({ data });
  }

  async update(id: string, data: { permissionName?: string; description?: string | null }) {
    const existing = await prisma.permission.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Permission not found");

    if (data.permissionName) {
      const duplicate = await prisma.permission.findFirst({
        where: { permissionName: data.permissionName, NOT: { id } },
      });
      if (duplicate) throw new ConflictError("Permission with this name already exists");
    }

    return prisma.permission.update({ where: { id }, data });
  }

  async delete(id: string) {
    const existing = await prisma.permission.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Permission not found");

    await prisma.permission.delete({ where: { id } });
  }
}

export const permissionService = new PermissionService();
