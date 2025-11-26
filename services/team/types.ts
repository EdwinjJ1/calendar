/**
 * Team Service Types
 */

import { z } from 'zod';
import type { Team, TeamMember, TeamRole, User } from '@prisma/client';

// ============================================================
// INPUT SCHEMAS
// ============================================================

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateTeamSchema = createTeamSchema.partial().extend({
  id: z.string().cuid(),
});

export const inviteMemberSchema = z.object({
  teamId: z.string().cuid(),
  email: z.string().email(),
  role: z.nativeEnum({ ADMIN: 'ADMIN', MEMBER: 'MEMBER', VIEWER: 'VIEWER' } as const).default('MEMBER'),
});

export const updateMemberRoleSchema = z.object({
  teamId: z.string().cuid(),
  userId: z.string().cuid(),
  role: z.nativeEnum({ ADMIN: 'ADMIN', MEMBER: 'MEMBER', VIEWER: 'VIEWER' } as const),
});

export const createUserFromClerkSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

// ============================================================
// INPUT TYPES
// ============================================================

export type CreateTeamInput = z.infer<typeof createTeamSchema> & {
  ownerId: string;
};

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type CreateUserFromClerkInput = z.infer<typeof createUserFromClerkSchema>;

// ============================================================
// OUTPUT TYPES
// ============================================================

/**
 * Team with member count
 */
export interface TeamSummary {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  memberCount: number;
  role: TeamRole;
}

/**
 * Team with all members
 */
export interface TeamWithMembers extends Team {
  members: MemberWithUser[];
  _count: {
    boards: number;
    channels: number;
  };
}

/**
 * Team member with user info
 */
export interface MemberWithUser extends TeamMember {
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

/**
 * User with their teams
 */
export interface UserWithTeams extends User {
  memberships: {
    team: TeamSummary;
    role: TeamRole;
  }[];
}

/**
 * Pending invitation
 */
export interface PendingInvitation {
  id: string;
  email: string;
  role: TeamRole;
  invitedAt: Date;
  expiresAt: Date;
}

