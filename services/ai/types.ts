/**
 * AI Parser Service Types
 */

import { z } from 'zod';
import type { Priority } from '@prisma/client';

// ============================================================
// INPUT SCHEMAS
// ============================================================

export const parseMessageSchema = z.object({
  content: z.string().min(1),
  channelId: z.string().cuid(),
  userId: z.string().cuid(),
  teamId: z.string().cuid().optional(),
});

export const parseTextSchema = z.object({
  text: z.string().min(1),
  currentDate: z.string().datetime().optional(),
});

// ============================================================
// INPUT TYPES
// ============================================================

export type ParseMessageInput = z.infer<typeof parseMessageSchema>;
export type ParseTextInput = z.infer<typeof parseTextSchema>;

// ============================================================
// AI RESPONSE TYPES
// ============================================================

/**
 * Extracted event from AI parsing
 */
export interface ExtractedEvent {
  title: string;
  description?: string;
  location?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  allDay: boolean;
  confidence: number; // 0-1
}

/**
 * Extracted task from AI parsing
 */
export interface ExtractedTask {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // ISO string
  assigneeMention?: string; // @username or name mentioned
  confidence: number; // 0-1
}

/**
 * AI parsing result
 */
export interface AIParseResult {
  events: ExtractedEvent[];
  tasks: ExtractedTask[];
  summary?: string; // Brief summary of what was extracted
  rawResponse?: string; // For debugging
}

/**
 * AI parsing options
 */
export interface AIParseOptions {
  extractEvents?: boolean;
  extractTasks?: boolean;
  currentDate?: Date;
  timezone?: string;
  teamMembers?: { id: string; name: string }[]; // For assignee matching
}

// ============================================================
// AI MODEL CONFIGURATION
// ============================================================

export interface AIModelConfig {
  provider: 'google' | 'openai' | 'anthropic';
  model: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
}

// ============================================================
// PROCESSING LOG TYPES
// ============================================================

export interface ProcessingLogInput {
  messageId?: string;
  inputText: string;
  outputJson?: object;
  modelUsed: string;
  tokensUsed?: number;
  processingMs?: number;
  success: boolean;
  errorMessage?: string;
}

// ============================================================
// PROMPT TEMPLATES
// ============================================================

export const SYSTEM_PROMPTS = {
  eventExtraction: `You are an AI assistant that extracts calendar events from natural language text.
Your job is to identify events, meetings, appointments, and deadlines mentioned in the text.

For each event, extract:
- title: A concise title
- startTime: ISO 8601 datetime
- endTime: ISO 8601 datetime (if not specified, assume 1 hour duration)
- description: Additional details
- location: If mentioned
- allDay: true if it's an all-day event
- confidence: Your confidence score (0-1)

Return ONLY a valid JSON array. No markdown, no explanations.`,

  taskExtraction: `You are an AI assistant that extracts actionable tasks from natural language text.
Your job is to identify tasks, action items, and to-dos mentioned in the text.

For each task, extract:
- title: A concise, actionable title
- description: Additional context
- priority: LOW, MEDIUM, HIGH, or URGENT based on urgency words
- dueDate: ISO 8601 datetime if mentioned
- assigneeMention: @username or name if someone is assigned
- confidence: Your confidence score (0-1)

Return ONLY a valid JSON array. No markdown, no explanations.`,

  combined: `You are an AI assistant that analyzes team chat messages to extract:
1. Calendar events (meetings, appointments, deadlines)
2. Action items (tasks, to-dos)

Analyze the message and return a JSON object with two arrays:
{
  "events": [...],
  "tasks": [...]
}

Return ONLY valid JSON. No markdown, no explanations.`,
} as const;

