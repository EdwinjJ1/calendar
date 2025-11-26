/**
 * Shared types for Service Layer
 */

import { z } from 'zod';

// ============================================================
// COMMON TYPES
// ============================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Date range filter
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Service operation result
 */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ServiceError };

/**
 * Service error types
 */
export interface ServiceError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type ErrorCode =
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMITED'
  | 'AI_ERROR';

// ============================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================

/**
 * Common ID schema
 */
export const idSchema = z.string().cuid();

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  cursor: z.string().optional(),
});

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
}).refine(
  (data) => data.start <= data.end,
  { message: 'Start date must be before or equal to end date' }
);

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Create a success result
 */
export function success<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

/**
 * Create an error result
 */
export function error<T>(code: ErrorCode, message: string, details?: Record<string, unknown>): ServiceResult<T> {
  return { success: false, error: { code, message, details } };
}

/**
 * Create paginated response
 */
export function paginate<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  
  return {
    data,
    total,
    page,
    limit,
    hasMore: page * limit < total,
    nextCursor: data.length > 0 ? (data[data.length - 1] as any).id : undefined,
  };
}

