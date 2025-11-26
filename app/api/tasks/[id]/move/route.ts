/**
 * Task Move API
 * 
 * POST /api/tasks/[id]/move - Move task to different column/position
 */

import { NextRequest, NextResponse } from 'next/server';
import { boardService } from '@/services';
import { requireUser, isTeamMember } from '@/lib/auth';
import { moveTaskSchema } from '@/services/board/types';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/tasks/[id]/move
 * Move a task to a different column or reorder within column
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();

    // Get existing task
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        column: {
          include: { board: { select: { teamId: true } } },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check team membership
    const isMember = await isTeamMember(user.id, task.column.board.teamId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate input
    const validationResult = moveTaskSchema.safeParse({
      taskId: id,
      targetColumnId: body.targetColumnId,
      newOrder: body.newOrder,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    // Move task
    const result = await boardService.moveTask(validationResult.data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error('POST /api/tasks/[id]/move error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

