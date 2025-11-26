/**
 * Single Team API
 * 
 * GET    /api/teams/[id]  - Get team details
 * PATCH  /api/teams/[id]  - Update team
 * DELETE /api/teams/[id]  - Delete team
 */

import { NextRequest, NextResponse } from 'next/server';
import { teamService } from '@/services';
import { requireUser, isTeamAdmin, isTeamOwner } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/teams/[id]
 * Get team details with members
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const result = await teamService.getTeamWithMembers(id, user.id);

    if (!result.success) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 
                     result.error.code === 'FORBIDDEN' ? 403 : 400;
      return NextResponse.json(
        { error: result.error.message },
        { status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error('GET /api/teams/[id] error:', error);
    
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
 * PATCH /api/teams/[id]
 * Update team (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();

    // Check if user is admin
    const isAdmin = await isTeamAdmin(user.id, id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update team
    const updated = await prisma.team.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        avatarUrl: body.avatarUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('PATCH /api/teams/[id] error:', error);
    
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
 * DELETE /api/teams/[id]
 * Delete team (owner only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;

    // Check if user is owner
    const isOwner = await isTeamOwner(user.id, id);
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Only the team owner can delete the team' },
        { status: 403 }
      );
    }

    // Delete team (cascade will handle members, boards, etc.)
    await prisma.team.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('DELETE /api/teams/[id] error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

