import { prisma } from "../../db";
import { ConflictError, NotFoundError } from "../../shared/types/error";

export class RoleService {
  async getAll() {
    return prisma.role.findMany({
      include: {
        rolePermissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  async getById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
    });
    if (!role) throw new NotFoundError("Role not found");
    return role;
  }

  async create(data: { name: string; permissionIds?: string[] }) {
    const existing = await prisma.role.findUnique({ where: { name: data.name } });
    if (existing) throw new ConflictError("Role with this name already exists");

    if (data.permissionIds?.length) {
      const permissions = await prisma.permission.findMany({
        where: { id: { in: data.permissionIds } },
      });
      if (permissions.length !== data.permissionIds.length) {
        throw new NotFoundError("One or more permissions not found");
      }
    }

    return prisma.role.create({
      data: {
        name: data.name,
        rolePermissions: data.permissionIds?.length
          ? { create: data.permissionIds.map((permissionId) => ({ permissionId })) }
          : undefined,
      },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
  }

  async update(id: string, data: { name?: string; permissionIds?: string[] }) {
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Role not found");

    if (data.name) {
      const duplicate = await prisma.role.findFirst({
        where: { name: data.name, NOT: { id } },
      });
      if (duplicate) throw new ConflictError("Role with this name already exists");
    }

    if (data.permissionIds !== undefined) {
      if (data.permissionIds.length) {
        const permissions = await prisma.permission.findMany({
          where: { id: { in: data.permissionIds } },
        });
        if (permissions.length !== data.permissionIds.length) {
          throw new NotFoundError("One or more permissions not found");
        }
      }

      await prisma.rolePermission.deleteMany({ where: { roleId: id } });

      if (data.permissionIds.length) {
        await prisma.rolePermission.createMany({
          data: data.permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        });
      }
    }

    if (data.name) {
      await prisma.role.update({ where: { id }, data: { name: data.name } });
    }

    return prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
  }

  async delete(id: string) {
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Role not found");

    const userCount = await prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) {
      await prisma.user.updateMany({ where: { roleId: id }, data: { roleId: null } });
    }

    await prisma.role.delete({ where: { id } });
  }
}

export const roleService = new RoleService();
