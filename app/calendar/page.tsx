'use client';

import { useState, useEffect, useCallback, useSyncExternalStore, useRef } from 'react';
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

// Custom hook to sync with localStorage using useSyncExternalStore
function useLocalStorageEvents(enabled: boolean) {
  const eventsRef = useRef<CalendarEvent[]>([]);

  const subscribe = useCallback((callback: () => void) => {
    const handleStorage = () => callback();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const getSnapshot = useCallback(() => {
    if (!enabled) return eventsRef.current;
    const stored = eventStorage.getAll();
    eventsRef.current = stored;
    return stored;
  }, [enabled]);

  const getServerSnapshot = useCallback(() => [], []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function CalendarPage() {
  // Feature flag check
  const useDB = useDatabaseStorage();
  const storageMode = useStorageMode();

  // Get events from localStorage using external store pattern
  const storedEvents = useLocalStorageEvents(!useDB);

  // Local state for localStorage mode - tracks modifications
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(storedEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // React Query hooks for database mode
  const { data: dbEvents = [], isLoading } = useEvents({});
  const createEventMutation = useCreateEvent();

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
    <>
      <div className="min-h-screen p-6 md:p-8 bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Calendar</h1>
                {/* Storage mode indicator (dev only) */}
                {process.env.NODE_ENV === 'development' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium uppercase tracking-wider">
                    {storageMode === 'database' ? 'DB' : 'Local'}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">Manage your schedule and events</p>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <AIImport onImport={handleImportEvents} />
              <Button onClick={() => exportEvents(events)} variant="outline" className="gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Export
              </Button>
              <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-lg shadow-green-900/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New Event
              </Button>
            </div>
          </motion.div>

          {isLoading && useDB ? (
            <div className="flex justify-center items-center h-[600px] bg-white rounded-3xl shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-avocado)]"></div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[24px] shadow-sm overflow-hidden p-1 border border-gray-100"
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
    </>
  );
}
