/**
 * Teams Hooks
 * 
 * React Query hooks for team operations.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================
// TYPES
// ============================================================

export interface TeamMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  createdAt: string;
  members?: TeamMember[];
  _count?: {
    members: number;
    boards: number;
  };
}

// ============================================================
// QUERY KEYS
// ============================================================

export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...teamKeys.lists(), filters] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

// ============================================================
// API FUNCTIONS
// ============================================================

async function fetchTeams(): Promise<{ teams: Team[] }> {
  const response = await fetch('/api/teams');
  if (!response.ok) {
    throw new Error('Failed to fetch teams');
  }
  return response.json();
}

async function fetchTeam(id: string): Promise<Team> {
  const response = await fetch(`/api/teams/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team');
  }
  return response.json();
}

async function createTeamAPI(data: { name: string; description?: string }): Promise<Team> {
  const response = await fetch('/api/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create team');
  }
  return response.json();
}

async function addMemberAPI(teamId: string, data: { email: string; role?: string }): Promise<TeamMember> {
  const response = await fetch(`/api/teams/${teamId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add member');
  }
  return response.json();
}

async function removeMemberAPI(teamId: string, userId: string): Promise<void> {
  const response = await fetch(`/api/teams/${teamId}/members?userId=${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove member');
  }
}

// ============================================================
// HOOKS
// ============================================================

export function useTeams() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: fetchTeams,
    select: (data) => data.teams,
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => fetchTeam(id),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeamAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: { email: string; role?: string } }) =>
      addMemberAPI(teamId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeMemberAPI(teamId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
    },
  });
}

