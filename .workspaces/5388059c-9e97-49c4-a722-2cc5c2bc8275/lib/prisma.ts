import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prismaClient = globalForPrisma.prisma ?? new PrismaClient();
export const prisma = prismaClient as any;
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;
