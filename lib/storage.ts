import { parseISO, formatISO } from 'date-fns';
import { STORAGE_KEYS } from './constants';
import type { CalendarEvent, TodoItem, StoredEvent, StoredTodo } from '@/types';

// 简单的泛型存储工具
const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
};

// Events
export const eventStorage = {
  getAll: (): CalendarEvent[] => {
    const stored = storage.get<StoredEvent[]>(STORAGE_KEYS.EVENTS) || [];
    return stored.map(e => ({
      ...e,
      start: parseISO(e.start),
      end: parseISO(e.end),
    }));
  },

  save: (events: CalendarEvent[]): void => {
    const toStore: StoredEvent[] = events.map(e => ({
      ...e,
      start: formatISO(e.start),
      end: formatISO(e.end),
    }));
    storage.set(STORAGE_KEYS.EVENTS, toStore);
  },
};

// Todos
export const todoStorage = {
  getAll: (): TodoItem[] => {
    const stored = storage.get<StoredTodo[]>(STORAGE_KEYS.TODOS) || [];
    return stored.map(t => ({
      ...t,
      createdAt: parseISO(t.createdAt),
      dueDate: t.dueDate ? parseISO(t.dueDate) : undefined,
    }));
  },

  save: (todos: TodoItem[]): void => {
    const toStore: StoredTodo[] = todos.map(t => ({
      ...t,
      createdAt: formatISO(t.createdAt),
      dueDate: t.dueDate ? formatISO(t.dueDate) : undefined,
    }));
    storage.set(STORAGE_KEYS.TODOS, toStore);
  },
};
