/**
 * Single Task API
 * 
 * GET    /api/tasks/[id]       - Get task by ID
 * PATCH  /api/tasks/[id]       - Update task
 * DELETE /api/tasks/[id]       - Delete task
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, isTeamMember } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]
 * Get a single task by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        column: {
          include: { board: { select: { teamId: true } } },
        },
        creator: { select: { id: true, name: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        labels: { include: { label: true } },
        _count: { select: { comments: true, attachments: true } },
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

    return NextResponse.json(task);
  } catch (error: any) {
    console.error('GET /api/tasks/[id] error:', error);
    
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
 * PATCH /api/tasks/[id]
 * Update a task
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Update task
    const { labelIds, ...updateData } = body;
    
    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Update labels if provided
    if (labelIds !== undefined) {
      await prisma.taskLabel.deleteMany({ where: { taskId: id } });
      if (labelIds.length > 0) {
        await prisma.taskLabel.createMany({
          data: labelIds.map((labelId: string) => ({ taskId: id, labelId })),
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('PATCH /api/tasks/[id] error:', error);
    
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
 * DELETE /api/tasks/[id]
 * Delete a task
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;

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

    await prisma.task.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('DELETE /api/tasks/[id] error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

