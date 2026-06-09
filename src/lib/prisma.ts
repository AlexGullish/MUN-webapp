import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrismaClient = () => {
  // Resolve SQLite database path relative to project root
  const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
  
  // Initialize Prisma better-sqlite3 adapter with url
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  
  // Return PrismaClient with adapter
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
