/**
 * Single Event API
 * 
 * GET    /api/events/[id]  - Get event by ID
 * PATCH  /api/events/[id]  - Update event
 * DELETE /api/events/[id]  - Delete event
 */

import { NextRequest, NextResponse } from 'next/server';
import { calendarService } from '@/services';
import { requireUser } from '@/lib/auth';
import { updateEventSchema } from '@/services/calendar/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/events/[id]
 * Get a single event by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const result = await calendarService.getEventById(id, user.id);

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
    console.error('GET /api/events/[id] error:', error);
    
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
 * PATCH /api/events/[id]
 * Update an event
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = updateEventSchema.safeParse({ ...body, id });
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    const result = await calendarService.updateEvent(
      validationResult.data,
      user.id
    );

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
    console.error('PATCH /api/events/[id] error:', error);
    
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
 * DELETE /api/events/[id]
 * Delete an event
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const result = await calendarService.deleteEvent(id, user.id);

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
    console.error('DELETE /api/events/[id] error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

