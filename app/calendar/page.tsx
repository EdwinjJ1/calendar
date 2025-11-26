'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import CalendarView from '@/components/calendar/CalendarView';
import EventModal from '@/components/calendar/EventModal';
import AIImport from '@/components/calendar/AIImport';
import Button from '@/components/ui/Button';
import { eventStorage } from '@/lib/storage';
import { exportEvents } from '@/lib/icsExport';
import { useDatabaseStorage, useStorageMode } from '@/hooks/useFeatureFlags';
import { useEvents, useCreateEvent } from '@/hooks/useEvents';
import type { CalendarEvent } from '@/types';

export default function CalendarPage() {
  // Feature flag check
  const useDB = useDatabaseStorage();
  const storageMode = useStorageMode();

  // Local state for localStorage mode
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // React Query hooks for database mode
  const { data: dbEvents = [], isLoading, refetch } = useEvents({});
  const createEventMutation = useCreateEvent();

  // Load events from localStorage on mount (localStorage mode only)
  useEffect(() => {
    if (!useDB) {
      setLocalEvents(eventStorage.getAll());
    }
  }, [useDB]);

  // Save to localStorage when events change (localStorage mode only)
  useEffect(() => {
    if (!useDB && localEvents.length > 0) {
      eventStorage.save(localEvents);
    }
  }, [localEvents, useDB]);

  // Determine which events to display
  const events = useDB ? dbEvents : localEvents;

  // Handle adding event
  const handleAddEvent = useCallback(async (event: Omit<CalendarEvent, 'id'>) => {
    if (useDB) {
      await createEventMutation.mutateAsync(event);
    } else {
      setLocalEvents(prev => [...prev, { ...event, id: nanoid() }]);
    }
  }, [useDB, createEventMutation]);

  // Handle importing events from AI
  const handleImportEvents = useCallback(async (importedEvents: CalendarEvent[]) => {
    const eventsWithIds = importedEvents.map(e => ({
      ...e,
      id: e.id || nanoid(),
    }));

    if (useDB) {
      // Create each event via API
      for (const event of eventsWithIds) {
        await createEventMutation.mutateAsync(event);
      }
    } else {
      setLocalEvents(prev => [...prev, ...eventsWithIds]);
    }
  }, [useDB, createEventMutation]);

  // Handle slot selection
  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setIsModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex justify-between items-center mb-8 flex-wrap gap-3"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-bold neon-text">📅 Calendar</h1>
            {/* Storage mode indicator (dev only) */}
            {process.env.NODE_ENV === 'development' && (
              <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                {storageMode === 'database' ? '🗄️ DB' : '💾 Local'}
              </span>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <AIImport onImport={handleImportEvents} />
            <Button onClick={() => exportEvents(events)} variant="secondary">
              📤 Export to Apple Calendar
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              ✨ New Event
            </Button>
          </div>
        </motion.div>

        {isLoading && useDB ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CalendarView
              events={events}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={event => console.log('Selected:', event)}
            />
          </motion.div>
        )}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
        }}
        onSave={handleAddEvent}
        initialData={selectedSlot || undefined}
      />
    </div>
  );
}
