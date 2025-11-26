/**
 * Calendar Service Types
 */

import { z } from 'zod';
import type { CalendarEvent, AttendeeStatus } from '@prisma/client';

// ============================================================
// INPUT SCHEMAS (for validation)
// ============================================================

/**
 * Create event input schema
 */
export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(500).optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  allDay: z.boolean().default(false),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  recurrence: z.string().optional(), // RRULE format
  teamId: z.string().cuid().optional(),
  attendeeIds: z.array(z.string().cuid()).optional(),
}).refine(
  (data) => data.startTime <= data.endTime,
  { message: 'Start time must be before or equal to end time' }
);

/**
 * Update event input schema
 */
export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().cuid(),
});

/**
 * Query events input schema
 */
export const queryEventsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  teamId: z.string().cuid().optional(),
  includePersonal: z.boolean().default(true),
  includeTeam: z.boolean().default(true),
});

// ============================================================
// INPUT TYPES (inferred from schemas)
// ============================================================

export type CreateEventInput = z.infer<typeof createEventSchema> & {
  creatorId: string;
  aiGenerated?: boolean;
  sourceMessageId?: string;
  confidence?: number;
};

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export type QueryEventsInput = z.infer<typeof queryEventsSchema> & {
  userId: string;
  teamIds?: string[];
};

// ============================================================
// OUTPUT TYPES
// ============================================================

/**
 * Event with related data
 */
export interface EventWithDetails extends CalendarEvent {
  creator: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  team?: {
    id: string;
    name: string;
  } | null;
  attendees?: {
    userId: string;
    status: AttendeeStatus;
    user: {
      id: string;
      name: string | null;
      avatarUrl: string | null;
    };
  }[];
}

/**
 * Event summary for calendar view
 */
export interface EventSummary {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  color: string | null;
  isTeamEvent: boolean;
  teamName?: string;
}

// ============================================================
// AI-GENERATED EVENT TYPES
// ============================================================

/**
 * AI-parsed event data (before saving to DB)
 */
export interface ParsedEventData {
  title: string;
  description?: string;
  location?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  allDay: boolean;
  confidence: number;
}

/**
 * Batch create events from AI input
 */
export interface BatchCreateEventsInput {
  events: ParsedEventData[];
  creatorId: string;
  teamId?: string;
  sourceMessageId: string;
}

