// 集中管理所有常量，避免magic number和硬编码

export const STORAGE_KEYS = {
  EVENTS: 'calendar_events',
  TODOS: 'calendar_todos',
} as const;

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.LOW]: '#10b981',    // green
  [PRIORITY_LEVELS.MEDIUM]: '#f59e0b', // yellow
  [PRIORITY_LEVELS.HIGH]: '#ef4444',   // red
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

export const CALENDAR_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  AGENDA: 'agenda',
} as const;

export const TODO_FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
} as const;

export const LIMITS = {
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  STORAGE_WARNING_THRESHOLD: 4 * 1024 * 1024, // 4MB
} as const;
