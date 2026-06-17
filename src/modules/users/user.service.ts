import { prisma } from "../../db";
import { NotFoundError, ForbiddenError } from "../../shared/types/error";

export class UserService {
  async getAllUsers() {
    const users = await prisma.user.findMany({
      include: { role: true },
    });
    return users.map(({ password, ...user }) => user);
  }

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    age: number;
    roleId?: string | null;
  }) {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        age: data.age,
        roleId: data.roleId,
      },
      include: { role: true },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(
    id: number,
    data: { name?: string; email?: string },
  ) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("User not found");

    const user = await prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserRole(
    id: number,
    roleId: string,
    requestingUserId: number,
  ) {
    if (id === requestingUserId) {
      throw new ForbiddenError("You cannot change your own role");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("User not found");

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundError("Role not found");

    const user = await prisma.user.update({
      where: { id },
      data: { roleId },
      include: { role: true },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(id: number, requestingUserId: number): Promise<void> {
    if (id === requestingUserId) {
      throw new ForbiddenError("You cannot delete your own account");
    }

    try {
      await prisma.user.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("User not found");
      }
      throw error;
    }
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user?.role) return [];

    return user.role.rolePermissions.map(
      (rp) => rp.permission.permissionName,
    );
  }
}

export const userService = new UserService();
