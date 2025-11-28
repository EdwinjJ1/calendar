'use client';

import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import type { CalendarEvent } from '@/types';
import { CALENDAR_VIEWS } from '@/lib/constants';

import { enUS } from 'date-fns/locale';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarViewProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

export default function CalendarView({ events, onSelectEvent, onSelectSlot }: CalendarViewProps) {
  return (
    <div className="h-[800px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        defaultView={CALENDAR_VIEWS.MONTH as View}
        views={[
          CALENDAR_VIEWS.MONTH,
          CALENDAR_VIEWS.WEEK,
          CALENDAR_VIEWS.DAY,
          CALENDAR_VIEWS.AGENDA,
        ] as View[]}
      />
    </div>
  );
}
