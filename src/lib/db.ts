import type { PrismaClient } from "@prisma/client";
import { createPrisma } from "./prisma";

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? createPrisma();
if (process.env.NODE_ENV !== "production") g.prisma = db;
