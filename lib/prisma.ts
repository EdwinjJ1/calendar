/**
 * Prisma Client Singleton
 * 
 * This file provides a singleton instance of PrismaClient for database access.
 * In development, we store the client on the global object to prevent
 * creating multiple instances during hot-reloading.
 * 
 * @see https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client';

// Type declaration for the global prisma instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Create Prisma Client with logging configuration
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
}

/**
 * Singleton Prisma Client instance
 * - In production: creates a new instance
 * - In development: reuses the global instance to avoid multiple connections
 */
export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Disconnect from the database
 * Useful for serverless environments or graceful shutdown
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Health check for database connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export default prisma;

