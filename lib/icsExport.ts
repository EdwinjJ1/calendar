import ical, { ICalCalendar } from 'ical-generator';
import type { CalendarEvent, TodoItem } from '@/types';

export const exportEvents = (events: CalendarEvent[], filename = 'calendar.ics'): void => {
  const calendar: ICalCalendar = ical({ name: 'My Calendar' });

  events.forEach(event => {
    calendar.createEvent({
      start: event.start,
      end: event.end,
      summary: event.title,
      description: event.description,
      location: event.location,
      allDay: event.allDay,
    });
  });

  downloadICS(calendar.toString(), filename);
};

export const exportTodos = (todos: TodoItem[], filename = 'todos.ics'): void => {
  const calendar: ICalCalendar = ical({ name: 'My Todos' });

  todos.forEach(todo => {
    calendar.createEvent({
      start: todo.dueDate || todo.createdAt,
      end: todo.dueDate || todo.createdAt,
      summary: todo.title,
      description: todo.description,
      categories: [{ name: todo.priority }, ...todo.categories.map(c => ({ name: c }))],
    });
  });

  downloadICS(calendar.toString(), filename);
};

const downloadICS = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
