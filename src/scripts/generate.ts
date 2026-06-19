import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const resourceName = process.argv[2];

if (!resourceName) {
  console.error("Usage: npm run generate <resourceName>");
  console.error("Example: npm run generate product");
  process.exit(1);

}

const singular = resourceName.toLowerCase();
const plural = singular.endsWith("s") ? singular : `${singular}s`;
const Pascal = singular.charAt(0).toUpperCase() + singular.slice(1);
const PluralPascal = plural.charAt(0).toUpperCase() + plural.slice(1);

const modulesDir = path.resolve(__dirname, "../modules");
const resourceDir = path.join(modulesDir, singular);

if (fs.existsSync(resourceDir)) {
  console.error(`Module "${singular}" already exists at ${resourceDir}`);
  process.exit(1);
}

fs.mkdirSync(resourceDir, { recursive: true });

function writeTemplate(filePath: string, lines: string[]) {
  fs.writeFileSync(filePath, lines.join("\n") + "\n");
}

// --- validation.ts ---
writeTemplate(path.join(resourceDir, `${singular}.validation.ts`), [
  `import { z } from "zod";`,
  ``,
  `export const getAll${PluralPascal}Schema = z.object({`,
  `  query: z.object({`,
  `    page: z.coerce.number().int().positive().default(1),`,
  `    limit: z.coerce.number().int().positive().max(100).default(10),`,
  `  }),`,
  `});`,
  ``,
  `export const create${Pascal}Schema = z.object({`,
  `  body: z.object({`,
  `    name: z.string().min(1, "Name is required"),`,
  `  }),`,
  `});`,
  ``,
  `export const update${Pascal}Schema = z.object({`,
  `  body: z.object({`,
  `    name: z.string().min(1).optional(),`,
  `  }),`,
  `  params: z.object({`,
  `    id: z.coerce.number({`,
  `      invalid_type_error: "ID must be a valid number",`,
  `    }),`,
  `  }),`,
  `});`,
  ``,
  `export const get${Pascal}ByIdSchema = z.object({`,
  `  params: z.object({`,
  `    id: z.coerce.number({`,
  `      invalid_type_error: "ID must be a valid number",`,
  `    }),`,
  `  }),`,
  `});`,
  ``,
  `export type Create${Pascal}Input = z.infer<typeof create${Pascal}Schema>["body"];`,
  `export type Update${Pascal}Input = z.infer<typeof update${Pascal}Schema>["body"];`,
]);

// --- service.ts ---
writeTemplate(path.join(resourceDir, `${singular}.service.ts`), [
  `import { prisma } from "../../db";`,
  `import { type ${Pascal} } from "../../generated/client/client";`,
  `import { type PaginatedResponse } from "../../shared/types";`,
  `import { NotFoundError } from "../../shared/types/error";`,
  ``,
  `export class ${Pascal}Service {`,
  `  async getAll(params: {`,
  `    page: number;`,
  `    limit: number;`,
  `  }): Promise<PaginatedResponse<unknown>> {`,
  `    const { page, limit } = params;`,
  `    const skip = (page - 1) * limit;`,
  ``,
  `    const [data, total] = await Promise.all([`,
  `      prisma.${singular}.findMany({`,
  `        skip,`,
  `        take: limit,`,
  `        orderBy: { createdAt: "desc" },`,
  `      }),`,
  `      prisma.${singular}.count(),`,
  `    ]);`,
  ``,
  `    return {`,
  `      data,`,
  `      pagination: {`,
  `        page,`,
  `        limit,`,
  `        total,`,
  `        totalPages: Math.ceil(total / limit),`,
  `      },`,
  `    };`,
  `  }`,
  ``,
  `  async getById(id: number): Promise<${Pascal}> {`,
  `    const ${singular} = await prisma.${singular}.findUnique({ where: { id } });`,
  `    if (!${singular}) throw new NotFoundError("${Pascal} not found");`,
  `    return ${singular};`,
  `  }`,
  ``,
  `  async create(data: { name: string }): Promise<${Pascal}> {`,
  `    return prisma.${singular}.create({ data });`,
  `  }`,
  ``,
  `  async update(id: number, data: { name?: string }): Promise<${Pascal}> {`,
  `    const existing = await prisma.${singular}.findUnique({ where: { id } });`,
  `    if (!existing) throw new NotFoundError("${Pascal} not found");`,
  `    return prisma.${singular}.update({ where: { id }, data });`,
  `  }`,
  ``,
  `  async delete(id: number): Promise<void> {`,
  `    const existing = await prisma.${singular}.findUnique({ where: { id } });`,
  `    if (!existing) throw new NotFoundError("${Pascal} not found");`,
  `    await prisma.${singular}.delete({ where: { id } });`,
  `  }`,
  `}`,
  ``,
  `export const ${singular}Service = new ${Pascal}Service();`,
]);

// --- controller.ts ---
writeTemplate(path.join(resourceDir, `${singular}.controller.ts`), [
  `import { type Response, type NextFunction } from "express";`,
  ``,
  `import { type AuthRequest } from "../../shared/types";`,
  `import { logger } from "../../shared/utils/logger";`,
  ``,
  `import { ${singular}Service } from "./${singular}.service";`,
  `import { type Create${Pascal}Input, type Update${Pascal}Input } from "./${singular}.validation";`,
  ``,
  `export class ${Pascal}Controller {`,
  `  async getAll(req: AuthRequest, res: Response, next: NextFunction) {`,
  `    try {`,
  `      const page = Number(req.query.page) || 1;`,
  `      const limit = Number(req.query.limit) || 10;`,
  ``,
  `      const result = await ${singular}Service.getAll({ page, limit });`,
  ``,
  `      res.status(200).json({`,
  `        status: true,`,
  `        message: "${PluralPascal} retrieved successfully",`,
  `        data: result,`,
  `      });`,
  `    } catch (error) {`,
  `      next(error);`,
  `    }`,
  `  }`,
  ``,
  `  async getById(req: AuthRequest, res: Response, next: NextFunction) {`,
  `    try {`,
  `      const { id } = req.params;`,
  `      const ${singular} = await ${singular}Service.getById(Number(id));`,
  `      res.status(200).json({ status: true, message: "${Pascal} retrieved successfully", data: ${singular} });`,
  `    } catch (error) {`,
  `      next(error);`,
  `    }`,
  `  }`,
  ``,
  `  async create(req: AuthRequest, res: Response, next: NextFunction) {`,
  `    try {`,
  `      const data = req.body as Create${Pascal}Input;`,
  `      const ${singular} = await ${singular}Service.create(data);`,
  `      logger.info("${Pascal} created: " + ${singular}.name);`,
  `      res.status(201).json({`,
  `        status: true,`,
  `        message: "${Pascal} created successfully",`,
  `        data: ${singular},`,
  `      });`,
  `    } catch (error) {`,
  `      next(error);`,
  `    }`,
  `  }`,
  ``,
  `  async update(req: AuthRequest, res: Response, next: NextFunction) {`,
  `    try {`,
  `      const { id } = req.params;`,
  `      const data = req.body as Update${Pascal}Input;`,
  `      const ${singular} = await ${singular}Service.update(Number(id), data);`,
  `      logger.info("${Pascal} updated: " + ${singular}.name);`,
  `      res.status(200).json({`,
  `        status: true,`,
  `        message: "${Pascal} updated successfully",`,
  `        data: ${singular},`,
  `      });`,
  `    } catch (error) {`,
  `      next(error);`,
  `    }`,
  `  }`,
  ``,
  `  async delete(req: AuthRequest, res: Response, next: NextFunction) {`,
  `    try {`,
  `      const { id } = req.params;`,
  `      await ${singular}Service.delete(Number(id));`,
  `      logger.info("${Pascal} deleted: " + id);`,
  `      res.status(200).json({`,
  `        status: true,`,
  `        message: "${Pascal} deleted successfully",`,
  `      });`,
  `    } catch (error) {`,
  `      next(error);`,
  `    }`,
  `  }`,
  `}`,
  ``,
  `export const ${singular}Controller = new ${Pascal}Controller();`,
]);

// --- route.ts ---
writeTemplate(path.join(resourceDir, `${singular}.route.ts`), [
  `import { Router } from "express";`,
  ``,
  `import { authenticate } from "../../shared/middleware/auth.middleware";`,
  `import { validate } from "../../shared/middleware/validate.middleware";`,
  ``,
  `import { ${singular}Controller } from "./${singular}.controller";`,
  `import {`,
  `  getAll${PluralPascal}Schema,`,
  `  create${Pascal}Schema,`,
  `  update${Pascal}Schema,`,
  `  get${Pascal}ByIdSchema,`,
  `} from "./${singular}.validation";`,
  ``,
  `const ${plural}Routes = Router();`,
  ``,
  `${plural}Routes.use(authenticate);`,
  ``,
  `${plural}Routes.get(`,
  `  "/",`,
  `  validate(getAll${PluralPascal}Schema),`,
  `  ${singular}Controller.getAll,`,
  `);`,
  ``,
  `${plural}Routes.get(`,
  `  "/:id",`,
  `  validate(get${Pascal}ByIdSchema),`,
  `  ${singular}Controller.getById,`,
  `);`,
  ``,
  `${plural}Routes.post(`,
  `  "/",`,
  `  validate(create${Pascal}Schema),`,
  `  ${singular}Controller.create,`,
  `);`,
  ``,
  `${plural}Routes.patch(`,
  `  "/:id",`,
  `  validate(update${Pascal}Schema),`,
  `  ${singular}Controller.update,`,
  `);`,
  ``,
  `${plural}Routes.delete(`,
  `  "/:id",`,
  `  validate(get${Pascal}ByIdSchema),`,
  `  ${singular}Controller.delete,`,
  `);`,
  ``,
  `export default ${plural}Routes;`,
]);

// --- Update routes.ts ---
const routesPath = path.resolve(__dirname, "../routes.ts");
let routesContent = fs.readFileSync(routesPath, "utf-8");

const importLine = `import ${plural}Routes from "./modules/${singular}/${singular}.route";`;
const routeLine = `router.use("/${plural}", ${plural}Routes);`;

if (!routesContent.includes(importLine)) {
  const lastImportIndex = routesContent.lastIndexOf("import ");
  const endOfLastImportLine = routesContent.indexOf("\n", lastImportIndex);
  routesContent =
    routesContent.slice(0, endOfLastImportLine + 1) +
    importLine +
    "\n" +
    routesContent.slice(endOfLastImportLine + 1);
}

if (!routesContent.includes(routeLine)) {
  const lastRouterUseIndex = routesContent.lastIndexOf('router.use("');
  const endOfLastRouterUseLine = routesContent.indexOf("\n", lastRouterUseIndex);
  routesContent =
    routesContent.slice(0, endOfLastRouterUseLine + 1) +
    routeLine +
    "\n" +
    routesContent.slice(endOfLastRouterUseLine + 1);
}

fs.writeFileSync(routesPath, routesContent);

// --- Update prisma/schema.prisma ---
const schemaPath = path.resolve(__dirname, "../../prisma/schema.prisma");
let schemaContent = fs.readFileSync(schemaPath, "utf-8");

const modelBlock = [
  ``,
  `model ${Pascal} {`,
  `  id        Int      @id @default(autoincrement())`,
  `  name      String   @db.VarChar(255)`,
  `  createdAt DateTime @default(now()) @map("created_at")`,
  `  updatedAt DateTime @updatedAt @map("updated_at")`,
  ``,
  `  @@map("${plural}")`,
  `}`,
  ``,
].join("\n");

if (!schemaContent.includes(`model ${Pascal} {`)) {
  schemaContent = schemaContent.trimEnd() + "\n" + modelBlock;
  fs.writeFileSync(schemaPath, schemaContent);
}

console.log(`\n  Created module: src/modules/${singular}/`);
console.log(`    - ${singular}.validation.ts`);
console.log(`    - ${singular}.service.ts`);
console.log(`    - ${singular}.controller.ts`);
console.log(`    - ${singular}.route.ts`);
console.log(`  Updated: src/routes.ts`);
console.log(`  Updated: prisma/schema.prisma (model ${Pascal})`);

// --- Run Prisma generate + migrate ---
console.log("\n  Running prisma generate...");
try {
  execSync("npx prisma generate", { stdio: "inherit", cwd: path.resolve(__dirname, "../..") });
} catch {
  console.error("  prisma generate failed");
  process.exit(1);
}

console.log("  Running prisma migrate dev...");
try {
  execSync(`npx prisma migrate dev --name add_${singular}`, { stdio: "inherit", cwd: path.resolve(__dirname, "../..") });
} catch {
  console.error("  prisma migrate failed");
  process.exit(1);
}

console.log(`\n  Done! Module "${singular}" is ready.\n`);
