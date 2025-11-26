/**
 * Team Service
 * 
 * Handles team and user management.
 * Integrates with Clerk for authentication.
 */

import { prisma } from '@/lib/prisma';
import type { Team, User, TeamRole } from '@prisma/client';
import { success, error, type ServiceResult } from '../shared/types';
import type {
  CreateTeamInput,
  UpdateTeamInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  CreateUserFromClerkInput,
  TeamSummary,
  TeamWithMembers,
  MemberWithUser,
} from './types';

// ============================================================
// TEAM SERVICE CLASS
// ============================================================

class TeamService {
  // ==================== USER OPERATIONS ====================

  /**
   * Create or update user from Clerk webhook
   */
  async upsertUserFromClerk(input: CreateUserFromClerkInput): Promise<ServiceResult<User>> {
    try {
      const user = await prisma.user.upsert({
        where: { clerkId: input.clerkId },
        update: {
          email: input.email,
          name: input.name,
          avatarUrl: input.avatarUrl,
        },
        create: {
          clerkId: input.clerkId,
          email: input.email,
          name: input.name,
          avatarUrl: input.avatarUrl,
        },
      });

      return success(user);
    } catch (err) {
      console.error('Failed to upsert user:', err);
      return error('INTERNAL_ERROR', 'Failed to sync user');
    }
  }

  /**
   * Get user by Clerk ID
   */
  async getUserByClerkId(clerkId: string): Promise<ServiceResult<User>> {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        return error('NOT_FOUND', 'User not found');
      }

      return success(user);
    } catch (err) {
      console.error('Failed to get user:', err);
      return error('INTERNAL_ERROR', 'Failed to get user');
    }
  }

  /**
   * Get all teams for a user
   */
  async getUserTeams(userId: string): Promise<ServiceResult<TeamSummary[]>> {
    try {
      const memberships = await prisma.teamMember.findMany({
        where: { userId },
        include: {
          team: {
            include: {
              _count: { select: { members: true } },
            },
          },
        },
      });

      const teams: TeamSummary[] = memberships.map((m) => ({
        id: m.team.id,
        name: m.team.name,
        slug: m.team.slug,
        avatarUrl: m.team.avatarUrl,
        memberCount: m.team._count.members,
        role: m.role,
      }));

      return success(teams);
    } catch (err) {
      console.error('Failed to get user teams:', err);
      return error('INTERNAL_ERROR', 'Failed to get teams');
    }
  }

  // ==================== TEAM OPERATIONS ====================

  /**
   * Create a new team
   */
  async createTeam(input: CreateTeamInput): Promise<ServiceResult<Team>> {
    try {
      // Check if slug is unique
      const existing = await prisma.team.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        return error('CONFLICT', 'A team with this slug already exists');
      }

      const team = await prisma.$transaction(async (tx) => {
        // Create team
        const newTeam = await tx.team.create({
          data: {
            name: input.name,
            slug: input.slug,
            description: input.description,
            avatarUrl: input.avatarUrl,
            ownerId: input.ownerId,
          },
        });

        // Add owner as member with OWNER role
        await tx.teamMember.create({
          data: {
            teamId: newTeam.id,
            userId: input.ownerId,
            role: 'OWNER',
          },
        });

        // Create default channel
        await tx.channel.create({
          data: {
            name: 'general',
            description: 'General discussion',
            teamId: newTeam.id,
            type: 'PUBLIC',
          },
        });

        return newTeam;
      });

      return success(team);
    } catch (err) {
      console.error('Failed to create team:', err);
      return error('INTERNAL_ERROR', 'Failed to create team');
    }
  }

  /**
   * Get team with all members
   */
  async getTeamWithMembers(
    teamId: string,
    userId: string
  ): Promise<ServiceResult<TeamWithMembers>> {
    try {
      // Check membership first
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
      });

      if (!membership) {
        return error('FORBIDDEN', 'You are not a member of this team');
      }

      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
            orderBy: { joinedAt: 'asc' },
          },
          _count: {
            select: { boards: true, channels: true },
          },
        },
      });

      if (!team) {
        return error('NOT_FOUND', 'Team not found');
      }

      return success(team as TeamWithMembers);
    } catch (err) {
      console.error('Failed to get team:', err);
      return error('INTERNAL_ERROR', 'Failed to get team');
    }
  }

  /**
   * Add a member to a team
   */
  async addMember(
    input: InviteMemberInput,
    inviterId: string
  ): Promise<ServiceResult<MemberWithUser>> {
    try {
      // Check if inviter has permission (OWNER or ADMIN)
      const inviterMembership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: input.teamId, userId: inviterId } },
      });

      if (!inviterMembership || !['OWNER', 'ADMIN'].includes(inviterMembership.role)) {
        return error('FORBIDDEN', 'You do not have permission to invite members');
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        return error('NOT_FOUND', 'User not found. They need to sign up first.');
      }

      // Check if already a member
      const existing = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: input.teamId, userId: user.id } },
      });

      if (existing) {
        return error('CONFLICT', 'User is already a member of this team');
      }

      // Add member
      const member = await prisma.teamMember.create({
        data: {
          teamId: input.teamId,
          userId: user.id,
          role: input.role as TeamRole,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      return success(member as MemberWithUser);
    } catch (err) {
      console.error('Failed to add member:', err);
      return error('INTERNAL_ERROR', 'Failed to add member');
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    input: UpdateMemberRoleInput,
    updaterId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Check permissions
      const updaterMembership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: input.teamId, userId: updaterId } },
      });

      if (!updaterMembership || updaterMembership.role !== 'OWNER') {
        return error('FORBIDDEN', 'Only the team owner can change roles');
      }

      // Cannot change owner role
      const targetMembership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: input.teamId, userId: input.userId } },
      });

      if (!targetMembership) {
        return error('NOT_FOUND', 'Member not found');
      }

      if (targetMembership.role === 'OWNER') {
        return error('FORBIDDEN', 'Cannot change owner role');
      }

      await prisma.teamMember.update({
        where: { teamId_userId: { teamId: input.teamId, userId: input.userId } },
        data: { role: input.role as TeamRole },
      });

      return success(undefined);
    } catch (err) {
      console.error('Failed to update member role:', err);
      return error('INTERNAL_ERROR', 'Failed to update role');
    }
  }

  /**
   * Remove a member from team
   */
  async removeMember(
    teamId: string,
    userId: string,
    removerId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Check permissions (OWNER, ADMIN, or self)
      const removerMembership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: removerId } },
      });

      const isSelf = userId === removerId;
      const hasPermission = removerMembership &&
        ['OWNER', 'ADMIN'].includes(removerMembership.role);

      if (!isSelf && !hasPermission) {
        return error('FORBIDDEN', 'You do not have permission to remove this member');
      }

      // Cannot remove owner
      const targetMembership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
      });

      if (!targetMembership) {
        return error('NOT_FOUND', 'Member not found');
      }

      if (targetMembership.role === 'OWNER') {
        return error('FORBIDDEN', 'Cannot remove the team owner');
      }

      await prisma.teamMember.delete({
        where: { teamId_userId: { teamId, userId } },
      });

      return success(undefined);
    } catch (err) {
      console.error('Failed to remove member:', err);
      return error('INTERNAL_ERROR', 'Failed to remove member');
    }
  }
}

// Export singleton instance
export const teamService = new TeamService();

