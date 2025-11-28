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

// Teams
export {
  useTeams,
  useTeam,
  useCreateTeam,
  useAddMember,
  useRemoveMember,
  teamKeys,
  type Team,
  type TeamMember,
} from './useTeams';

// Boards
export {
  useBoards,
  useBoard,
  useMoveTask,
  boardKeys,
  type Board,
  type Column,
  type Task,
} from './useBoards';

// Chat
export {
  useChannels,
  useMessages,
  useSendMessage,
  chatKeys,
  type Channel,
  type Message,
} from './useChat';

