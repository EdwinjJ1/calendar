/**
 * Teams API
 * 
 * GET  /api/teams       - List user's teams
 * POST /api/teams       - Create team
 */

import { NextRequest, NextResponse } from 'next/server';
import { teamService } from '@/services';
import { requireUser } from '@/lib/auth';
import { createTeamSchema } from '@/services/team/types';

/**
 * GET /api/teams
 * List all teams the current user belongs to
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    const result = await teamService.getUserTeams(user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ teams: result.data });
  } catch (error: any) {
    console.error('GET /api/teams error:', error);
    
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
 * POST /api/teams
 * Create a new team
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();

    // Validate input
    const validationResult = createTeamSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    // Create team
    const result = await teamService.createTeam({
      ...validationResult.data,
      ownerId: user.id,
    });

    if (!result.success) {
      const status = result.error.code === 'CONFLICT' ? 409 : 400;
      return NextResponse.json(
        { error: result.error.message },
        { status }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/teams error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

