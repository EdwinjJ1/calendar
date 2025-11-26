/**
 * Calendar Service
 * 
 * Handles all calendar event business logic.
 * Supports personal events, team events, and AI-generated events.
 */

import { prisma } from '@/lib/prisma';
import type { CalendarEvent, Prisma } from '@prisma/client';
import { 
  success, 
  error, 
  paginate, 
  type ServiceResult, 
  type PaginationParams,
  type PaginatedResponse 
} from '../shared/types';
import type { 
  CreateEventInput, 
  UpdateEventInput, 
  QueryEventsInput,
  EventWithDetails,
  EventSummary,
  BatchCreateEventsInput,
  createEventSchema,
} from './types';

// ============================================================
// CALENDAR SERVICE CLASS
// ============================================================

class CalendarService {
  /**
   * Create a new calendar event
   */
  async createEvent(input: CreateEventInput): Promise<ServiceResult<CalendarEvent>> {
    try {
      const event = await prisma.calendarEvent.create({
        data: {
          title: input.title,
          description: input.description,
          location: input.location,
          startTime: input.startTime,
          endTime: input.endTime,
          allDay: input.allDay ?? false,
          color: input.color,
          recurrence: input.recurrence,
          creatorId: input.creatorId,
          teamId: input.teamId,
          aiGenerated: input.aiGenerated ?? false,
          sourceMessageId: input.sourceMessageId,
          confidence: input.confidence,
        },
      });

      return success(event);
    } catch (err) {
      console.error('Failed to create event:', err);
      return error('INTERNAL_ERROR', 'Failed to create event');
    }
  }

  /**
   * Get event by ID with full details
   */
  async getEventById(
    eventId: string,
    userId: string
  ): Promise<ServiceResult<EventWithDetails>> {
    try {
      const event = await prisma.calendarEvent.findUnique({
        where: { id: eventId },
        include: {
          creator: {
            select: { id: true, name: true, avatarUrl: true },
          },
          team: {
            select: { id: true, name: true },
          },
          attendees: {
            select: {
              userId: true,
              status: true,
            },
          },
        },
      });

      if (!event) {
        return error('NOT_FOUND', 'Event not found');
      }

      // Check access: user must be creator, team member, or attendee
      const hasAccess = await this.checkEventAccess(event, userId);
      if (!hasAccess) {
        return error('FORBIDDEN', 'You do not have access to this event');
      }

      // Transform to expected type
      const result: EventWithDetails = {
        ...event,
        attendees: event.attendees.map(a => ({
          userId: a.userId,
          status: a.status,
          user: { id: a.userId, name: null, avatarUrl: null }, // Would need separate query
        })),
      };

      return success(result);
    } catch (err) {
      console.error('Failed to get event:', err);
      return error('INTERNAL_ERROR', 'Failed to get event');
    }
  }

  /**
   * Query events for a user (personal + team events)
   */
  async getEvents(
    input: QueryEventsInput,
    pagination?: PaginationParams
  ): Promise<ServiceResult<PaginatedResponse<EventSummary>>> {
    try {
      const { userId, teamIds = [], startDate, endDate, includePersonal, includeTeam } = input;
      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 50;

      // Build where clause
      const conditions: Prisma.CalendarEventWhereInput[] = [];

      if (includePersonal) {
        conditions.push({ creatorId: userId, teamId: null });
      }

      if (includeTeam && teamIds.length > 0) {
        conditions.push({ teamId: { in: teamIds } });
      }

      const where: Prisma.CalendarEventWhereInput = {
        AND: [
          { OR: conditions.length > 0 ? conditions : [{ id: 'never-match' }] },
          startDate ? { startTime: { gte: startDate } } : {},
          endDate ? { endTime: { lte: endDate } } : {},
        ],
      };

      const [events, total] = await Promise.all([
        prisma.calendarEvent.findMany({
          where,
          include: {
            team: { select: { name: true } },
          },
          orderBy: { startTime: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.calendarEvent.count({ where }),
      ]);

      const summaries: EventSummary[] = events.map((e) => ({
        id: e.id,
        title: e.title,
        startTime: e.startTime,
        endTime: e.endTime,
        allDay: e.allDay,
        color: e.color,
        isTeamEvent: !!e.teamId,
        teamName: e.team?.name,
      }));

      return success(paginate(summaries, total, { page, limit }));
    } catch (err) {
      console.error('Failed to query events:', err);
      return error('INTERNAL_ERROR', 'Failed to query events');
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(
    input: UpdateEventInput,
    userId: string
  ): Promise<ServiceResult<CalendarEvent>> {
    try {
      const existing = await prisma.calendarEvent.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        return error('NOT_FOUND', 'Event not found');
      }

      // Only creator can update
      if (existing.creatorId !== userId) {
        return error('FORBIDDEN', 'Only the creator can update this event');
      }

      const { id, ...updateData } = input;
      const updated = await prisma.calendarEvent.update({
        where: { id },
        data: updateData,
      });

      return success(updated);
    } catch (err) {
      console.error('Failed to update event:', err);
      return error('INTERNAL_ERROR', 'Failed to update event');
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string, userId: string): Promise<ServiceResult<void>> {
    try {
      const existing = await prisma.calendarEvent.findUnique({
        where: { id: eventId },
      });

      if (!existing) {
        return error('NOT_FOUND', 'Event not found');
      }

      // Only creator can delete
      if (existing.creatorId !== userId) {
        return error('FORBIDDEN', 'Only the creator can delete this event');
      }

      await prisma.calendarEvent.delete({ where: { id: eventId } });
      return success(undefined);
    } catch (err) {
      console.error('Failed to delete event:', err);
      return error('INTERNAL_ERROR', 'Failed to delete event');
    }
  }

  /**
   * Batch create events from AI parsing
   */
  async batchCreateFromAI(
    input: BatchCreateEventsInput
  ): Promise<ServiceResult<CalendarEvent[]>> {
    try {
      const events = await prisma.$transaction(
        input.events.map((eventData) =>
          prisma.calendarEvent.create({
            data: {
              title: eventData.title,
              description: eventData.description,
              location: eventData.location,
              startTime: new Date(eventData.startTime),
              endTime: new Date(eventData.endTime),
              allDay: eventData.allDay,
              creatorId: input.creatorId,
              teamId: input.teamId,
              aiGenerated: true,
              sourceMessageId: input.sourceMessageId,
              confidence: eventData.confidence,
            },
          })
        )
      );

      return success(events);
    } catch (err) {
      console.error('Failed to batch create events:', err);
      return error('INTERNAL_ERROR', 'Failed to create events from AI');
    }
  }

  /**
   * Check if user has access to an event
   */
  private async checkEventAccess(
    event: CalendarEvent,
    userId: string
  ): Promise<boolean> {
    // Creator always has access
    if (event.creatorId === userId) return true;

    // If team event, check team membership
    if (event.teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: { teamId: event.teamId, userId: userId },
        },
      });
      return !!membership;
    }

    return false;
  }
}

// Export singleton instance
export const calendarService = new CalendarService();

