import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config/env";
import { PrismaClient } from "./generated/client/client";

const adapter = new PrismaPg({ connectionString: config.database.url });

export const prisma = new PrismaClient({ adapter });
