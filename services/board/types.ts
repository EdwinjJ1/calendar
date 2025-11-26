/**
 * Board Service Types
 */

import { z } from 'zod';
import type { Board, Column, Task, Priority, TaskStatus } from '@prisma/client';

// ============================================================
// INPUT SCHEMAS
// ============================================================

export const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  teamId: z.string().cuid(),
});

export const createColumnSchema = z.object({
  name: z.string().min(1).max(50),
  boardId: z.string().cuid(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  wipLimit: z.number().int().positive().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  columnId: z.string().cuid(),
  priority: z.nativeEnum({ LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', URGENT: 'URGENT' } as const).default('MEDIUM'),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().cuid().optional(),
  labelIds: z.array(z.string().cuid()).optional(),
  estimate: z.number().int().positive().optional(),
});

export const moveTaskSchema = z.object({
  taskId: z.string().cuid(),
  targetColumnId: z.string().cuid(),
  newOrder: z.number().int().nonnegative(),
});

export const reorderColumnsSchema = z.object({
  boardId: z.string().cuid(),
  columnOrders: z.array(z.object({
    columnId: z.string().cuid(),
    order: z.number().int().nonnegative(),
  })),
});

// ============================================================
// INPUT TYPES
// ============================================================

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema> & {
  creatorId: string;
  aiGenerated?: boolean;
  sourceMessageId?: string;
  confidence?: number;
};
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;

// ============================================================
// OUTPUT TYPES
// ============================================================

/**
 * Board with all columns and tasks
 */
export interface BoardWithDetails extends Board {
  columns: ColumnWithTasks[];
}

/**
 * Column with tasks
 */
export interface ColumnWithTasks extends Column {
  tasks: TaskWithDetails[];
}

/**
 * Task with related data
 */
export interface TaskWithDetails extends Task {
  creator: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  assignee?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  } | null;
  labels: {
    id: string;
    name: string;
    color: string;
  }[];
  commentCount: number;
  attachmentCount: number;
}

/**
 * Task summary for list views
 */
export interface TaskSummary {
  id: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: Date | null;
  assignee?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  } | null;
  labelColors: string[];
}

// ============================================================
// AI-GENERATED TASK TYPES
// ============================================================

/**
 * AI-parsed task data
 */
export interface ParsedTaskData {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // ISO string
  assigneeName?: string; // AI may extract name, we resolve to ID
  confidence: number;
}

/**
 * Batch create tasks from AI
 */
export interface BatchCreateTasksInput {
  tasks: ParsedTaskData[];
  columnId: string;
  creatorId: string;
  sourceMessageId: string;
}

