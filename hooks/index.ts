/**
 * Hooks Index
 * 
 * Central export for all custom hooks.
 */

// Feature Flags
export {
  useFeatureFlag,
  useDatabaseStorage,
  useStorageMode,
  useTeamsEnabled,
  useBoardsEnabled,
  useChatEnabled,
  useAllFeatureFlags,
} from './useFeatureFlags';

// Calendar Events
export {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  eventKeys,
} from './useEvents';

// Todos
export {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useToggleTodo,
  useDeleteTodo,
  todoKeys,
} from './useTodos';

