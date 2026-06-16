import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client/client";
// Initialize the adapter according to your driver's requirements
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
// Pass the adapter instance to PrismaClient
export const prisma = new PrismaClient({ adapter });
