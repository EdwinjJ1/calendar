/**
 * Tasks API
 * 
 * GET  /api/tasks       - List tasks
 * POST /api/tasks       - Create task
 */

import { NextRequest, NextResponse } from 'next/server';
import { boardService } from '@/services';
import { requireUser, getUserTeamIds, isTeamMember } from '@/lib/auth';
import { createTaskSchema } from '@/services/board/types';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/tasks
 * List tasks for a board/column
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const searchParams = request.nextUrl.searchParams;

    const boardId = searchParams.get('boardId');
    const columnId = searchParams.get('columnId');
    const assigneeId = searchParams.get('assigneeId');

    if (!boardId) {
      return NextResponse.json(
        { error: 'boardId is required' },
        { status: 400 }
      );
    }

    // Get board with tasks
    const result = await boardService.getBoardWithDetails(boardId, user.id);

    if (!result.success) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 
                     result.error.code === 'FORBIDDEN' ? 403 : 400;
      return NextResponse.json(
        { error: result.error.message },
        { status }
      );
    }

    // Filter tasks if columnId or assigneeId provided
    let tasks = result.data.columns.flatMap((col) => col.tasks);
    
    if (columnId) {
      tasks = tasks.filter((t) => t.columnId === columnId);
    }
    
    if (assigneeId) {
      tasks = tasks.filter((t) => t.assigneeId === assigneeId);
    }

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('GET /api/tasks error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();

    // Validate input
    const validationResult = createTaskSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // Verify column exists and user has access to the board
    const column = await prisma.column.findUnique({
      where: { id: input.columnId },
      include: { board: { select: { teamId: true } } },
    });

    if (!column) {
      return NextResponse.json(
        { error: 'Column not found' },
        { status: 404 }
      );
    }

    // Check team membership
    const isMember = await isTeamMember(user.id, column.board.teamId);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this team' },
        { status: 403 }
      );
    }

    // Create task
    const result = await boardService.createTask({
      ...input,
      creatorId: user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/tasks error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

