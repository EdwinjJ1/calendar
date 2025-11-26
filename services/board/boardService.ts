/**
 * Board Service
 * 
 * Handles Kanban board, column, and task business logic.
 * Supports drag-and-drop reordering and AI-generated tasks.
 */

import { prisma } from '@/lib/prisma';
import type { Board, Column, Task } from '@prisma/client';
import { success, error, type ServiceResult } from '../shared/types';
import type {
  CreateBoardInput,
  CreateColumnInput,
  CreateTaskInput,
  MoveTaskInput,
  ReorderColumnsInput,
  BoardWithDetails,
  TaskWithDetails,
  BatchCreateTasksInput,
} from './types';

// ============================================================
// BOARD SERVICE CLASS
// ============================================================

class BoardService {
  // ==================== BOARD OPERATIONS ====================

  /**
   * Create a new board with default columns
   */
  async createBoard(input: CreateBoardInput): Promise<ServiceResult<Board>> {
    try {
      const board = await prisma.$transaction(async (tx) => {
        // Create board
        const newBoard = await tx.board.create({
          data: {
            name: input.name,
            description: input.description,
            teamId: input.teamId,
          },
        });

        // Create default columns
        const defaultColumns = [
          { name: 'To Do', order: 0, color: '#6B7280' },
          { name: 'In Progress', order: 1, color: '#3B82F6' },
          { name: 'In Review', order: 2, color: '#F59E0B' },
          { name: 'Done', order: 3, color: '#10B981' },
        ];

        await tx.column.createMany({
          data: defaultColumns.map((col) => ({
            ...col,
            boardId: newBoard.id,
          })),
        });

        return newBoard;
      });

      return success(board);
    } catch (err) {
      console.error('Failed to create board:', err);
      return error('INTERNAL_ERROR', 'Failed to create board');
    }
  }

  /**
   * Get board with all columns and tasks
   */
  async getBoardWithDetails(
    boardId: string,
    userId: string
  ): Promise<ServiceResult<BoardWithDetails>> {
    try {
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
          columns: {
            orderBy: { order: 'asc' },
            include: {
              tasks: {
                orderBy: { order: 'asc' },
                include: {
                  creator: { select: { id: true, name: true, avatarUrl: true } },
                  assignee: { select: { id: true, name: true, avatarUrl: true } },
                  labels: { include: { label: true } },
                  _count: { select: { comments: true, attachments: true } },
                },
              },
            },
          },
        },
      });

      if (!board) {
        return error('NOT_FOUND', 'Board not found');
      }

      // Check team membership
      const hasAccess = await this.checkBoardAccess(board.teamId, userId);
      if (!hasAccess) {
        return error('FORBIDDEN', 'You do not have access to this board');
      }

      // Transform to expected format
      const result: BoardWithDetails = {
        ...board,
        columns: board.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((task) => ({
            ...task,
            labels: task.labels.map((tl) => tl.label),
            commentCount: task._count.comments,
            attachmentCount: task._count.attachments,
          })) as TaskWithDetails[],
        })),
      };

      return success(result);
    } catch (err) {
      console.error('Failed to get board:', err);
      return error('INTERNAL_ERROR', 'Failed to get board');
    }
  }

  /**
   * Get all boards for a team
   */
  async getTeamBoards(teamId: string, userId: string): Promise<ServiceResult<Board[]>> {
    try {
      const hasAccess = await this.checkBoardAccess(teamId, userId);
      if (!hasAccess) {
        return error('FORBIDDEN', 'You do not have access to this team');
      }

      const boards = await prisma.board.findMany({
        where: { teamId },
        orderBy: { createdAt: 'desc' },
      });

      return success(boards);
    } catch (err) {
      console.error('Failed to get team boards:', err);
      return error('INTERNAL_ERROR', 'Failed to get team boards');
    }
  }

  // ==================== COLUMN OPERATIONS ====================

  /**
   * Add a new column to a board
   */
  async createColumn(input: CreateColumnInput): Promise<ServiceResult<Column>> {
    try {
      // Get highest order
      const maxOrder = await prisma.column.aggregate({
        where: { boardId: input.boardId },
        _max: { order: true },
      });

      const column = await prisma.column.create({
        data: {
          name: input.name,
          boardId: input.boardId,
          color: input.color,
          wipLimit: input.wipLimit,
          order: (maxOrder._max.order ?? -1) + 1,
        },
      });

      return success(column);
    } catch (err) {
      console.error('Failed to create column:', err);
      return error('INTERNAL_ERROR', 'Failed to create column');
    }
  }

  /**
   * Reorder columns within a board
   */
  async reorderColumns(input: ReorderColumnsInput): Promise<ServiceResult<void>> {
    try {
      await prisma.$transaction(
        input.columnOrders.map(({ columnId, order }) =>
          prisma.column.update({
            where: { id: columnId },
            data: { order },
          })
        )
      );
      return success(undefined);
    } catch (err) {
      console.error('Failed to reorder columns:', err);
      return error('INTERNAL_ERROR', 'Failed to reorder columns');
    }
  }

  // ==================== TASK OPERATIONS ====================

  /**
   * Create a new task
   */
  async createTask(input: CreateTaskInput): Promise<ServiceResult<Task>> {
    try {
      // Get highest order in column
      const maxOrder = await prisma.task.aggregate({
        where: { columnId: input.columnId },
        _max: { order: true },
      });

      const task = await prisma.task.create({
        data: {
          title: input.title,
          description: input.description,
          columnId: input.columnId,
          creatorId: input.creatorId,
          assigneeId: input.assigneeId,
          priority: input.priority,
          dueDate: input.dueDate,
          estimate: input.estimate,
          order: (maxOrder._max.order ?? -1) + 1,
          aiGenerated: input.aiGenerated ?? false,
          sourceMessageId: input.sourceMessageId,
          confidence: input.confidence,
        },
      });

      // Add labels if provided
      if (input.labelIds?.length) {
        await prisma.taskLabel.createMany({
          data: input.labelIds.map((labelId) => ({
            taskId: task.id,
            labelId,
          })),
        });
      }

      return success(task);
    } catch (err) {
      console.error('Failed to create task:', err);
      return error('INTERNAL_ERROR', 'Failed to create task');
    }
  }

  /**
   * Move task to different column and/or reorder
   */
  async moveTask(input: MoveTaskInput): Promise<ServiceResult<Task>> {
    try {
      const task = await prisma.task.findUnique({
        where: { id: input.taskId },
      });

      if (!task) {
        return error('NOT_FOUND', 'Task not found');
      }

      // Update orders in transaction
      const updated = await prisma.$transaction(async (tx) => {
        // If moving to a different column, update orders in both columns
        if (task.columnId !== input.targetColumnId) {
          // Decrement orders in source column
          await tx.task.updateMany({
            where: {
              columnId: task.columnId,
              order: { gt: task.order },
            },
            data: { order: { decrement: 1 } },
          });

          // Increment orders in target column
          await tx.task.updateMany({
            where: {
              columnId: input.targetColumnId,
              order: { gte: input.newOrder },
            },
            data: { order: { increment: 1 } },
          });
        } else {
          // Reordering within same column
          if (input.newOrder > task.order) {
            await tx.task.updateMany({
              where: {
                columnId: task.columnId,
                order: { gt: task.order, lte: input.newOrder },
              },
              data: { order: { decrement: 1 } },
            });
          } else {
            await tx.task.updateMany({
              where: {
                columnId: task.columnId,
                order: { gte: input.newOrder, lt: task.order },
              },
              data: { order: { increment: 1 } },
            });
          }
        }

        // Update the moved task
        return tx.task.update({
          where: { id: input.taskId },
          data: {
            columnId: input.targetColumnId,
            order: input.newOrder,
          },
        });
      });

      return success(updated);
    } catch (err) {
      console.error('Failed to move task:', err);
      return error('INTERNAL_ERROR', 'Failed to move task');
    }
  }

  /**
   * Batch create tasks from AI parsing
   */
  async batchCreateFromAI(input: BatchCreateTasksInput): Promise<ServiceResult<Task[]>> {
    try {
      const maxOrder = await prisma.task.aggregate({
        where: { columnId: input.columnId },
        _max: { order: true },
      });

      let currentOrder = (maxOrder._max.order ?? -1) + 1;

      const tasks = await prisma.$transaction(
        input.tasks.map((taskData) => {
          const order = currentOrder++;
          return prisma.task.create({
            data: {
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority,
              dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
              columnId: input.columnId,
              creatorId: input.creatorId,
              order,
              aiGenerated: true,
              sourceMessageId: input.sourceMessageId,
              confidence: taskData.confidence,
            },
          });
        })
      );

      return success(tasks);
    } catch (err) {
      console.error('Failed to batch create tasks:', err);
      return error('INTERNAL_ERROR', 'Failed to create tasks from AI');
    }
  }

  // ==================== HELPER METHODS ====================

  private async checkBoardAccess(teamId: string, userId: string): Promise<boolean> {
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    return !!membership;
  }
}

// Export singleton instance
export const boardService = new BoardService();

