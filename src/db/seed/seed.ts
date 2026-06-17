import { prisma } from "..";
import { hashPassword } from "../../shared/utils/password.utils";
import dotenv from "dotenv";

dotenv.config();

const permissionsData = [
  { permissionName: "user:read", description: "View users" },
  { permissionName: "user:create", description: "Create users" },
  { permissionName: "user:update", description: "Update users" },
  { permissionName: "user:delete", description: "Delete users" },
  { permissionName: "role:read", description: "View roles" },
  { permissionName: "role:create", description: "Create roles" },
  { permissionName: "role:update", description: "Update roles" },
  { permissionName: "role:delete", description: "Delete roles" },
  { permissionName: "permission:read", description: "View permissions" },
  { permissionName: "permission:create", description: "Create permissions" },
  { permissionName: "permission:update", description: "Update permissions" },
  { permissionName: "permission:delete", description: "Delete permissions" },
];

async function seed() {
  console.log("Seeding started...");

  const createdPermissions = await Promise.all(
    permissionsData.map((p) =>
      prisma.permission.upsert({
        where: { permissionName: p.permissionName },
        update: {},
        create: p,
      }),
    ),
  );
  console.log(`Seeded ${createdPermissions.length} permissions`);

  const allPermissionIds = createdPermissions.map((p) => p.id);

  const superadminRole = await prisma.role.upsert({
    where: { name: "superadmin" },
    update: {},
    create: { name: "superadmin" },
  });

  await prisma.rolePermission.deleteMany({
    where: { roleId: superadminRole.id },
  });
  await prisma.rolePermission.createMany({
    data: allPermissionIds.map((permissionId) => ({
      roleId: superadminRole.id,
      permissionId,
    })),
  });
  console.log(
    `Assigned all ${allPermissionIds.length} permissions to superadmin role`,
  );

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const adminPermissionNames = [
    "user:read",
    "user:create",
    "user:update",
    "role:read",
    "permission:read",
  ];
  const adminPermissionIds = createdPermissions
    .filter((p) => adminPermissionNames.includes(p.permissionName))
    .map((p) => p.id);

  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });
  if (adminPermissionIds.length) {
    await prisma.rolePermission.createMany({
      data: adminPermissionIds.map((permissionId) => ({
        roleId: adminRole.id,
        permissionId,
      })),
    });
  }
  console.log(
    `Assigned ${adminPermissionIds.length} permissions to admin role`,
  );

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user" },
  });

  const userPermissionNames = ["user:read"];
  const userPermissionIds = createdPermissions
    .filter((p) => userPermissionNames.includes(p.permissionName))
    .map((p) => p.id);

  await prisma.rolePermission.deleteMany({ where: { roleId: userRole.id } });
  if (userPermissionIds.length) {
    await prisma.rolePermission.createMany({
      data: userPermissionIds.map((permissionId) => ({
        roleId: userRole.id,
        permissionId,
      })),
    });
  }
  console.log(`Assigned ${userPermissionIds.length} permissions to user role`);

  const superadminEmail = "superadmin@example.com";
  const existingSuperadmin = await prisma.user.findUnique({
    where: { email: superadminEmail },
  });

  if (!existingSuperadmin) {
    const hashedPassword = await hashPassword("SuperAdmin123!");
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: superadminEmail,
        password: hashedPassword,
        age: 30,
        roleId: superadminRole.id,
      },
    });
    console.log(
      "Superadmin user created: superadmin@example.com / SuperAdmin123!",
    );
  } else {
    console.log("Superadmin user already exists");
  }

  console.log("Seeding completed!");
}

seed()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
