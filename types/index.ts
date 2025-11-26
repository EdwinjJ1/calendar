import { PRIORITY_LEVELS } from '@/lib/constants';

export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  allDay?: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: PriorityLevel;
  categories: string[];
}

export interface StoredEvent extends Omit<CalendarEvent, 'start' | 'end'> {
  start: string;
  end: string;
}

export interface StoredTodo extends Omit<TodoItem, 'createdAt' | 'dueDate'> {
  createdAt: string;
  dueDate?: string;
}
