/* eslint-disable no-console */
import dotenv from "dotenv";
import { prisma } from "..";
import { hashPassword } from "../../shared/utils/password.utils";

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

  const postsData = [
    {
      title: "Getting Started with Express.js",
      content:
        "Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It is widely used for building RESTful APIs and single-page applications.",
    },
    {
      title: "Understanding TypeScript Generics",
      content:
        "Generics provide a way to create reusable components that work with any data type. They allow you to write flexible and type-safe code without sacrificing the benefits of static typing.",
    },
    {
      title: "Prisma ORM: A Complete Guide",
      content:
        "Prisma is a next-generation ORM for Node.js and TypeScript. It provides type-safe database access, auto-generated migrations, and an intuitive API for working with your database.",
    },
    {
      title: "RESTful API Design Best Practices",
      content:
        "Designing a good REST API requires careful consideration of resource naming, HTTP methods, status codes, pagination, filtering, and versioning strategies.",
    },
    {
      title: "Introduction to PostgreSQL",
      content:
        "PostgreSQL is a powerful, open-source object-relational database system with over 35 years of active development. It has earned a strong reputation for reliability, feature robustness, and performance.",
    },
    {
      title: "JWT Authentication in Node.js",
      content:
        "JSON Web Tokens provide a compact and self-contained way to securely transmit information between parties as a JSON object. They are commonly used for authentication and authorization.",
    },
    {
      title: "Middleware in Express.js",
      content:
        "Middleware functions are functions that have access to the request object, response object, and the next middleware function. They can execute code, modify request and response objects, and end the request-response cycle.",
    },
    {
      title: "Error Handling in Node.js Applications",
      content:
        "Proper error handling is crucial for building robust applications. This includes synchronous error handling with try-catch, asynchronous error handling, and global error handlers.",
    },
    {
      title: "Database Migrations with Prisma",
      content:
        "Prisma Migrate is a migration system that lets you easily evolve your database schema over time. It generates SQL migrations and keeps track of which migrations have been applied.",
    },
    {
      title: "Role-Based Access Control (RBAC)",
      content:
        "RBAC is an approach to restricting system access to authorized users. It involves assigning roles to users and defining permissions for each role, making access management scalable and maintainable.",
    },
    {
      title: "Building a Blog API with Express",
      content:
        "A blog API typically includes endpoints for creating, reading, updating, and deleting posts, managing comments, handling user authentication, and implementing pagination for listing posts.",
    },
    {
      title: "TypeScript Interfaces vs Types",
      content:
        "Both interfaces and types can be used to define the shape of objects in TypeScript. While they are similar in many ways, there are subtle differences in how they work with unions, intersections, and declaration merging.",
    },
    {
      title: "Connecting to PostgreSQL with Prisma",
      content:
        "Prisma uses a connection URL to connect to your database. The connection string includes the protocol, username, password, host, port, and database name. Connection pooling is handled automatically.",
    },
    {
      title: "API Rate Limiting Strategies",
      content:
        "Rate limiting helps protect your API from abuse by limiting the number of requests a client can make within a given time window. Common strategies include fixed window, sliding window, and token bucket algorithms.",
    },
    {
      title: "Logging in Node.js with Winston",
      content:
        "Winston is a versatile logging library for Node.js that supports multiple transports, log levels, formatting, and rotation. It is widely used for application logging in production environments.",
    },
    {
      title: "Environment Variables in Node.js",
      content:
        "Environment variables allow you to configure your application for different environments without changing code. They are used for secrets, database URLs, API keys, and other configuration values.",
    },
    {
      title: "Testing Express APIs with Jest",
      content:
        "Jest is a popular testing framework for JavaScript that provides a complete testing solution with assertions, mocking, and coverage. It works well with Supertest for testing Express endpoints.",
    },
    {
      title: "Swagger Documentation for APIs",
      content:
        "Swagger provides a standard way to document REST APIs. It includes the OpenAPI Specification for describing your API and Swagger UI for generating interactive documentation.",
    },
    {
      title: "Database Indexing for Performance",
      content:
        "Indexes improve the speed of data retrieval operations on database tables. Proper indexing strategy involves understanding query patterns, choosing the right index types, and avoiding over-indexing.",
    },
    {
      title: "CORS in Express.js",
      content:
        "Cross-Origin Resource Sharing (CORS) is a mechanism that allows restricted resources on a web page to be requested from another domain. Express provides the cors middleware for handling CORS headers.",
    },
    {
      title: "Helmet.js for Security Headers",
      content:
        "Helmet helps secure Express apps by setting various HTTP headers. It includes protection against clickjacking, XSS attacks, and other common web vulnerabilities.",
    },
    {
      title: "Async/Await Patterns in JavaScript",
      content:
        "Async/await is syntactic sugar over promises that makes asynchronous code look and feel synchronous. It provides a cleaner way to handle asynchronous operations compared to callbacks and promise chains.",
    },
    {
      title: "Data Validation with Zod",
      content:
        "Zod is a TypeScript-first schema validation library that provides a concise and type-safe way to validate data. It integrates well with Express middleware for request validation.",
    },
    {
      title: "Hashing Passwords with bcrypt",
      content:
        "bcrypt is a password hashing function designed to be slow and computationally expensive to make brute-force attacks impractical. It automatically generates and verifies salted hash values.",
    },
    {
      title: "Nodemon for Development",
      content:
        "Nodemon is a utility that monitors for changes in your source code and automatically restarts the Node.js server. It significantly improves the development workflow by eliminating manual restarts.",
    },
    {
      title: "Express Router for Modular Code",
      content:
        "Express Router allows you to organize your routes into separate files or modules. This makes your codebase more maintainable and easier to scale as your application grows.",
    },
    {
      title: "Database Transactions in Prisma",
      content:
        "Prisma supports interactive transactions that allow you to run multiple operations in a single database transaction. This ensures data consistency when multiple operations need to succeed or fail together.",
    },
    {
      title: "Pagination Techniques for APIs",
      content:
        "Pagination is essential for APIs that return large datasets. Common approaches include offset-based pagination, cursor-based pagination, and keyset pagination, each with its own trade-offs.",
    },
    {
      title: "File Upload Handling in Express",
      content:
        "File uploads in Express are typically handled using middleware like multer. It parses multipart/form-data requests and makes uploaded files available on the request object.",
    },
    {
      title: "Deploying Node.js Applications",
      content:
        "Deploying Node.js applications involves choosing a hosting platform, configuring environment variables, setting up process managers like PM2, and implementing CI/CD pipelines for automated deployments.",
    },
  ];

  const existingPostCount = await prisma.post.count();
  if (existingPostCount === 0) {
    await prisma.post.createMany({
      data: postsData.map((p, index) => ({
        title: p.title,
        content: p.content,
        createdAt: new Date(Date.now() - (postsData.length - index) * 86400000),
      })),
    });
    console.log(`Seeded ${postsData.length} posts`);
  } else {
    console.log(`Posts already exist (${existingPostCount} found), skipping`);
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
