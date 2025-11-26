/**
 * Authentication Utilities
 * 
 * Helper functions for authentication and authorization.
 * Integrates with Clerk for user management.
 */

import { prisma } from './prisma';
import type { User } from '@prisma/client';

// ============================================================
// MOCK AUTH (for development before Clerk is set up)
// ============================================================

/**
 * Development user for testing when Clerk is not configured
 */
const DEV_USER = {
  id: 'dev-user-id',
  clerkId: 'dev-clerk-id',
  email: 'dev@example.com',
  name: 'Dev User',
  avatarUrl: null,
  timezone: 'UTC',
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies User;

/**
 * Check if Clerk is configured
 */
export function isClerkConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  );
}

// ============================================================
// USER RESOLUTION
// ============================================================

/**
 * Get the current user from the request
 * Returns dev user if Clerk is not configured (development mode)
 */
export async function getCurrentUser(): Promise<User | null> {
  // If Clerk is not configured, return dev user for development
  if (!isClerkConfigured()) {
    // In development, try to get or create the dev user in the database
    try {
      const user = await prisma.user.upsert({
        where: { clerkId: DEV_USER.clerkId },
        update: {},
        create: DEV_USER,
      });
      return user;
    } catch {
      // If database is not available, return the mock user
      return DEV_USER;
    }
  }

  // TODO: Implement Clerk integration
  // const { userId } = auth();
  // if (!userId) return null;
  // return prisma.user.findUnique({ where: { clerkId: userId } });
  
  return null;
}

/**
 * Get user ID for API routes
 * Throws if not authenticated
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Get team IDs that user belongs to
 */
export async function getUserTeamIds(userId: string): Promise<string[]> {
  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  });
  return memberships.map((m) => m.teamId);
}

// ============================================================
// AUTHORIZATION HELPERS
// ============================================================

/**
 * Check if user is a member of a team
 */
export async function isTeamMember(
  userId: string,
  teamId: string
): Promise<boolean> {
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  return !!membership;
}

/**
 * Check if user is admin or owner of a team
 */
export async function isTeamAdmin(
  userId: string,
  teamId: string
): Promise<boolean> {
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  return membership?.role === 'OWNER' || membership?.role === 'ADMIN';
}

/**
 * Check if user owns a team
 */
export async function isTeamOwner(
  userId: string,
  teamId: string
): Promise<boolean> {
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  return membership?.role === 'OWNER';
}

