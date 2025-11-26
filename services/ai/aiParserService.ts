/**
 * AI Parser Service
 * 
 * Handles AI-powered parsing of natural language to extract
 * calendar events and tasks from chat messages.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { success, error, type ServiceResult } from '../shared/types';
import type {
  ParseMessageInput,
  ParseTextInput,
  AIParseResult,
  AIParseOptions,
  ExtractedEvent,
  ExtractedTask,
  ProcessingLogInput,
  SYSTEM_PROMPTS,
} from './types';
import { calendarService } from '../calendar/calendarService';
import { boardService } from '../board/boardService';

// ============================================================
// AI PARSER SERVICE CLASS
// ============================================================

class AIParserService {
  private genAI: GoogleGenerativeAI | null = null;

  /**
   * Initialize the AI client
   */
  private getAIClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = process.env.AI_API_KEY;
      if (!apiKey) {
        throw new Error('AI_API_KEY is not configured');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Parse text to extract events and tasks
   */
  async parseText(
    input: ParseTextInput,
    options: AIParseOptions = {}
  ): Promise<ServiceResult<AIParseResult>> {
    const startTime = Date.now();
    
    try {
      const client = this.getAIClient();
      const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const currentDate = options.currentDate || new Date();
      const prompt = this.buildPrompt(input.text, currentDate, options);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let jsonString = response.text();

      // Clean up response
      jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(jsonString);
      const parseResult: AIParseResult = {
        events: parsed.events || [],
        tasks: parsed.tasks || [],
        rawResponse: jsonString,
      };

      // Log successful processing
      await this.logProcessing({
        inputText: input.text,
        outputJson: parseResult,
        modelUsed: 'gemini-2.0-flash',
        processingMs: Date.now() - startTime,
        success: true,
      });

      return success(parseResult);
    } catch (err: any) {
      console.error('AI parsing failed:', err);

      // Log failed processing
      await this.logProcessing({
        inputText: input.text,
        modelUsed: 'gemini-2.0-flash',
        processingMs: Date.now() - startTime,
        success: false,
        errorMessage: err.message,
      });

      return error('AI_ERROR', `AI parsing failed: ${err.message}`);
    }
  }

  /**
   * Parse a chat message and create events/tasks
   */
  async parseMessageAndCreate(
    input: ParseMessageInput,
    options: AIParseOptions = {}
  ): Promise<ServiceResult<{ eventsCreated: number; tasksCreated: number }>> {
    try {
      // First, parse the text
      const parseResult = await this.parseText(
        { text: input.content },
        { ...options, currentDate: new Date() }
      );

      if (!parseResult.success) {
        return error(parseResult.error.code, parseResult.error.message);
      }

      const { events, tasks } = parseResult.data;
      let eventsCreated = 0;
      let tasksCreated = 0;

      // Create events if any were extracted
      if (events.length > 0 && options.extractEvents !== false) {
        // Save the message first to get an ID
        const message = await prisma.message.create({
          data: {
            content: input.content,
            userId: input.userId,
            channelId: input.channelId,
            aiProcessed: true,
            aiResult: parseResult.data as any,
          },
        });

        const eventResult = await calendarService.batchCreateFromAI({
          events: events.map((e) => ({
            title: e.title,
            description: e.description,
            location: e.location,
            startTime: e.startTime,
            endTime: e.endTime,
            allDay: e.allDay,
            confidence: e.confidence,
          })),
          creatorId: input.userId,
          teamId: input.teamId,
          sourceMessageId: message.id,
        });

        if (eventResult.success) {
          eventsCreated = eventResult.data.length;
        }
      }

      // Create tasks if any were extracted
      if (tasks.length > 0 && options.extractTasks !== false) {
        // Find default board/column for the team
        // This would need a default column lookup
        // For now, we'll skip task creation if no column specified
        tasksCreated = 0; // TODO: Implement task creation
      }

      return success({ eventsCreated, tasksCreated });
    } catch (err: any) {
      console.error('Failed to parse message and create:', err);
      return error('INTERNAL_ERROR', 'Failed to process message');
    }
  }

  /**
   * Build the AI prompt
   */
  private buildPrompt(text: string, currentDate: Date, options: AIParseOptions): string {
    const dateContext = currentDate.toISOString();
    const timezone = options.timezone || 'UTC';

    let teamContext = '';
    if (options.teamMembers?.length) {
      const names = options.teamMembers.map((m) => m.name).join(', ');
      teamContext = `\nTeam members: ${names}`;
    }

    return `You are an AI assistant that analyzes messages to extract calendar events and tasks.

Current date: ${dateContext}
Timezone: ${timezone}${teamContext}

Message to analyze:
"""
${text}
"""

Extract any events and tasks from the message above.

For events, include:
- title, startTime (ISO), endTime (ISO), description, location, allDay, confidence (0-1)

For tasks, include:
- title, description, priority (LOW/MEDIUM/HIGH/URGENT), dueDate (ISO if mentioned), assigneeMention, confidence (0-1)

Return ONLY valid JSON in this format:
{
  "events": [...],
  "tasks": [...]
}

If nothing to extract, return: {"events": [], "tasks": []}`;
  }

  /**
   * Log AI processing for analytics and debugging
   */
  private async logProcessing(input: ProcessingLogInput): Promise<void> {
    try {
      await prisma.aIProcessingLog.create({
        data: {
          messageId: input.messageId,
          inputText: input.inputText,
          outputJson: input.outputJson as any,
          modelUsed: input.modelUsed,
          tokensUsed: input.tokensUsed,
          processingMs: input.processingMs,
          success: input.success,
          errorMessage: input.errorMessage,
        },
      });
    } catch (err) {
      // Don't fail if logging fails
      console.error('Failed to log AI processing:', err);
    }
  }

  /**
   * Get parsing statistics
   */
  async getStats(days: number = 7): Promise<{
    totalProcessed: number;
    successRate: number;
    avgProcessingMs: number;
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await prisma.aIProcessingLog.findMany({
      where: { createdAt: { gte: since } },
      select: { success: true, processingMs: true },
    });

    if (logs.length === 0) {
      return { totalProcessed: 0, successRate: 0, avgProcessingMs: 0 };
    }

    const successCount = logs.filter((l) => l.success).length;
    const avgMs = logs.reduce((sum, l) => sum + (l.processingMs || 0), 0) / logs.length;

    return {
      totalProcessed: logs.length,
      successRate: successCount / logs.length,
      avgProcessingMs: Math.round(avgMs),
    };
  }
}

// Export singleton instance
export const aiParserService = new AIParserService();

