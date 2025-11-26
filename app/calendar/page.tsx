'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import CalendarView from '@/components/calendar/CalendarView';
import EventModal from '@/components/calendar/EventModal';
import AIImport from '@/components/calendar/AIImport';
import Button from '@/components/ui/Button';
import { eventStorage } from '@/lib/storage';
import { exportEvents } from '@/lib/icsExport';
import type { CalendarEvent } from '@/types';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    setEvents(eventStorage.getAll());
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      eventStorage.save(events);
    }
  }, [events]);

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    setEvents([...events, { ...event, id: nanoid() }]);
  };

  const handleImportEvents = (importedEvents: CalendarEvent[]) => {
    const eventsWithIds = importedEvents.map(e => ({
      ...e,
      id: e.id || nanoid(),
    }));
    setEvents([...events, ...eventsWithIds]);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex justify-between items-center mb-8 flex-wrap gap-3"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-5xl font-bold neon-text">📅 Calendar</h1>
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
