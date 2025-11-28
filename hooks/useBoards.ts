/**
 * Boards Hooks
 * 
 * React Query hooks for board/kanban operations.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================
// TYPES
// ============================================================

export interface Task {
  id: string;
  title: string;
  description: string | null;
  order: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  columnId: string;
  assigneeId: string | null;
  dueDate: string | null;
  labels: { label: { id: string; name: string; color: string } }[];
  assignee?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  } | null;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  color: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  teamId: string;
  columns: Column[];
  team?: {
    id: string;
    name: string;
  };
}

// ============================================================
// DEMO DATA (for local development without database)
// ============================================================

const demoBoards: Board[] = [
  {
    id: 'demo-board-1',
    name: 'Project Alpha',
    description: 'Main project board',
    teamId: 'demo-team-1',
    team: { id: 'demo-team-1', name: 'Demo Team' },
    columns: [
      {
        id: 'col-1',
        name: 'To Do',
        order: 0,
        color: '#00ffff',
        tasks: [
          { id: 't1', title: 'Design new landing page', description: 'Create wireframes and mockups', order: 0, priority: 'HIGH', columnId: 'col-1', assigneeId: null, dueDate: null, labels: [] },
          { id: 't2', title: 'Setup CI/CD pipeline', description: null, order: 1, priority: 'MEDIUM', columnId: 'col-1', assigneeId: null, dueDate: null, labels: [] },
        ],
      },
      {
        id: 'col-2',
        name: 'In Progress',
        order: 1,
        color: '#ffff00',
        tasks: [
          { id: 't3', title: 'Implement auth system', description: 'Use Clerk for authentication', order: 0, priority: 'URGENT', columnId: 'col-2', assigneeId: null, dueDate: null, labels: [] },
        ],
      },
      {
        id: 'col-3',
        name: 'Review',
        order: 2,
        color: '#ff006e',
        tasks: [],
      },
      {
        id: 'col-4',
        name: 'Done',
        order: 3,
        color: '#00ff41',
        tasks: [
          { id: 't4', title: 'Project setup', description: 'Initialize Next.js project', order: 0, priority: 'LOW', columnId: 'col-4', assigneeId: null, dueDate: null, labels: [] },
        ],
      },
    ],
  },
];

// ============================================================
// QUERY KEYS
// ============================================================

export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...boardKeys.lists(), filters] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  detail: (id: string) => [...boardKeys.details(), id] as const,
};

// ============================================================
// HOOKS
// ============================================================

export function useBoards(teamId?: string) {
  return useQuery({
    queryKey: boardKeys.list({ teamId }),
    queryFn: async () => {
      // Return demo data for now
      return demoBoards;
    },
  });
}

export function useBoard(id: string) {
  return useQuery({
    queryKey: boardKeys.detail(id),
    queryFn: async () => {
      const board = demoBoards.find((b) => b.id === id);
      if (!board) throw new Error('Board not found');
      return board;
    },
    enabled: !!id,
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      sourceColumnId,
      targetColumnId,
      newOrder,
    }: {
      taskId: string;
      sourceColumnId: string;
      targetColumnId: string;
      newOrder: number;
    }) => {
      // In a real app, this would call the API
      console.log('Move task:', { taskId, sourceColumnId, targetColumnId, newOrder });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}

