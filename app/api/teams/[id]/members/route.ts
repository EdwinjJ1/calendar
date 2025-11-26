/**
 * Team Members API
 * 
 * POST   /api/teams/[id]/members  - Add member
 * DELETE /api/teams/[id]/members  - Remove member
 */

import { NextRequest, NextResponse } from 'next/server';
import { teamService } from '@/services';
import { requireUser } from '@/lib/auth';
import { inviteMemberSchema } from '@/services/team/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/teams/[id]/members
 * Add a member to the team
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = inviteMemberSchema.safeParse({
      teamId: id,
      email: body.email,
      role: body.role,
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

    // Add member
    const result = await teamService.addMember(validationResult.data, user.id);

    if (!result.success) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 
                     result.error.code === 'FORBIDDEN' ? 403 :
                     result.error.code === 'CONFLICT' ? 409 : 400;
      return NextResponse.json(
        { error: result.error.message },
        { status }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/teams/[id]/members error:', error);
    
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
 * DELETE /api/teams/[id]/members
 * Remove a member from the team
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Remove member
    const result = await teamService.removeMember(id, userId, user.id);

    if (!result.success) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 
                     result.error.code === 'FORBIDDEN' ? 403 : 400;
      return NextResponse.json(
        { error: result.error.message },
        { status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('DELETE /api/teams/[id]/members error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

