/**
 * Calendar Events Hooks
 * 
 * React Query hooks for calendar event operations.
 * Supports both database and localStorage modes via Feature Flags.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDatabaseStorage } from './useFeatureFlags';
import { eventStorage } from '@/lib/storage';
import type { CalendarEvent } from '@/types';
import type { EventSummary, PaginatedResponse } from '@/services';

// ============================================================
// QUERY KEYS
// ============================================================

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

// ============================================================
// API FUNCTIONS
// ============================================================

interface FetchEventsParams {
  startDate?: string;
  endDate?: string;
  teamId?: string;
  includePersonal?: boolean;
  includeTeam?: boolean;
}

async function fetchEventsFromAPI(params: FetchEventsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  if (params.teamId) searchParams.set('teamId', params.teamId);
  if (params.includePersonal !== undefined) 
    searchParams.set('includePersonal', String(params.includePersonal));
  if (params.includeTeam !== undefined) 
    searchParams.set('includeTeam', String(params.includeTeam));

  const response = await fetch(`/api/events?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json() as Promise<PaginatedResponse<EventSummary>>;
}

async function createEventAPI(event: Omit<CalendarEvent, 'id'>) {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: event.title,
      description: event.description,
      location: event.location,
      startTime: event.start,
      endTime: event.end,
      allDay: event.allDay,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to create event');
  }
  return response.json();
}

async function updateEventAPI(event: CalendarEvent) {
  const response = await fetch(`/api/events/${event.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: event.title,
      description: event.description,
      location: event.location,
      startTime: event.start,
      endTime: event.end,
      allDay: event.allDay,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to update event');
  }
  return response.json();
}

async function deleteEventAPI(eventId: string) {
  const response = await fetch(`/api/events/${eventId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete event');
  }
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Fetch events - works with both localStorage and database
 */
export function useEvents(params: FetchEventsParams = {}) {
  const useDB = useDatabaseStorage();

  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      if (useDB) {
        const result = await fetchEventsFromAPI(params);
        // Convert API response to CalendarEvent format
        return result.data.map((e) => ({
          id: e.id,
          title: e.title,
          start: new Date(e.startTime),
          end: new Date(e.endTime),
          allDay: e.allDay,
          color: e.color || undefined,
        })) as CalendarEvent[];
      } else {
        // Use localStorage
        const events = eventStorage.getAll();
        // Apply date filters if provided
        let filtered = events;
        if (params.startDate) {
          const start = new Date(params.startDate);
          filtered = filtered.filter((e) => e.start >= start);
        }
        if (params.endDate) {
          const end = new Date(params.endDate);
          filtered = filtered.filter((e) => e.end <= end);
        }
        return filtered;
      }
    },
  });
}

/**
 * Create event mutation
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const useDB = useDatabaseStorage();

  return useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id'>) => {
      if (useDB) {
        return createEventAPI(event);
      } else {
        const events = eventStorage.getAll();
        const newEvent: CalendarEvent = {
          ...event,
          id: crypto.randomUUID(),
        };
        eventStorage.save([...events, newEvent]);
        return newEvent;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

/**
 * Update event mutation
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const useDB = useDatabaseStorage();

  return useMutation({
    mutationFn: async (event: CalendarEvent) => {
      if (useDB) {
        return updateEventAPI(event);
      } else {
        const events = eventStorage.getAll();
        const updated = events.map((e) =>
          e.id === event.id ? event : e
        );
        eventStorage.save(updated);
        return event;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
    },
  });
}

/**
 * Delete event mutation
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const useDB = useDatabaseStorage();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (useDB) {
        return deleteEventAPI(eventId);
      } else {
        const events = eventStorage.getAll();
        const filtered = events.filter((e) => e.id !== eventId);
        eventStorage.save(filtered);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

