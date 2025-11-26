/**
 * Calendar Events API
 * 
 * GET  /api/events       - List events
 * POST /api/events       - Create event
 */

import { NextRequest, NextResponse } from 'next/server';
import { calendarService } from '@/services';
import { requireUser, getUserTeamIds } from '@/lib/auth';
import { createEventSchema, queryEventsSchema } from '@/services/calendar/types';
import { z } from 'zod';

/**
 * GET /api/events
 * List calendar events for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const query = {
      startDate: searchParams.get('startDate') 
        ? new Date(searchParams.get('startDate')!) 
        : undefined,
      endDate: searchParams.get('endDate') 
        ? new Date(searchParams.get('endDate')!) 
        : undefined,
      teamId: searchParams.get('teamId') || undefined,
      includePersonal: searchParams.get('includePersonal') !== 'false',
      includeTeam: searchParams.get('includeTeam') !== 'false',
    };

    // Get user's team IDs
    const teamIds = await getUserTeamIds(user.id);

    // Fetch events
    const result = await calendarService.getEvents(
      {
        userId: user.id,
        teamIds,
        ...query,
      },
      {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '50'),
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error('GET /api/events error:', error);
    
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
 * POST /api/events
 * Create a new calendar event
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();

    // Validate input
    const validationResult = createEventSchema.safeParse(body);
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

    // If teamId is provided, verify membership
    if (input.teamId) {
      const teamIds = await getUserTeamIds(user.id);
      if (!teamIds.includes(input.teamId)) {
        return NextResponse.json(
          { error: 'You are not a member of this team' },
          { status: 403 }
        );
      }
    }

    // Create event
    const result = await calendarService.createEvent({
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
    console.error('POST /api/events error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

