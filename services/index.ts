/**
 * Service Layer Index
 * 
 * Central export for all service modules.
 * Import services from this file for cleaner imports.
 * 
 * @example
 * import { calendarService, teamService } from '@/services';
 */

// Calendar Service
export { calendarService } from './calendar/calendarService';
export type {
  CreateEventInput,
  UpdateEventInput,
  QueryEventsInput,
  EventWithDetails,
  EventSummary,
  ParsedEventData,
  BatchCreateEventsInput,
} from './calendar/types';

// Board Service
export { boardService } from './board/boardService';
export type {
  CreateBoardInput,
  CreateColumnInput,
  CreateTaskInput,
  MoveTaskInput,
  ReorderColumnsInput,
  BoardWithDetails,
  ColumnWithTasks,
  TaskWithDetails,
  TaskSummary,
  ParsedTaskData,
  BatchCreateTasksInput,
} from './board/types';

// Team Service
export { teamService } from './team/teamService';
export type {
  CreateTeamInput,
  UpdateTeamInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  CreateUserFromClerkInput,
  TeamSummary,
  TeamWithMembers,
  MemberWithUser,
  UserWithTeams,
  PendingInvitation,
} from './team/types';

// AI Parser Service
export { aiParserService } from './ai/aiParserService';
export type {
  ParseMessageInput,
  ParseTextInput,
  AIParseResult,
  AIParseOptions,
  ExtractedEvent,
  ExtractedTask,
  AIModelConfig,
  ProcessingLogInput,
} from './ai/types';

// Shared Types
export type {
  PaginationParams,
  PaginatedResponse,
  SortDirection,
  DateRange,
  ServiceResult,
  ServiceError,
  ErrorCode,
} from './shared/types';

export {
  success,
  error,
  paginate,
} from './shared/types';

