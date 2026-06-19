import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";
import { config } from "../config/env";

const adapter = new PrismaPg({ connectionString: config.database.url });

export const prisma = new PrismaClient({ adapter });
