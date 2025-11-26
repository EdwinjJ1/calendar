import { CalendarEvent } from '@/types';

/**
 * 智能解析Markdown学习计划，自动生成日历事件
 * 支持格式：
 * - "上午 11:00 - 下午 2:30"
 * - "11:00-14:30"
 * - "11:00 AM - 2:30 PM"
 */

interface ParsedTimeSlot {
  start: Date;
  end: Date;
  title: string;
  description?: string;
}

/**
 * 解析时间字符串（支持中文和英文）
 */
function parseTime(timeStr: string, baseDate: Date): Date | null {
  // 移除空格
  const cleaned = timeStr.trim();

  // 匹配模式：上午/下午/晚上 HH:MM 或 HH:MM AM/PM
  const patterns = [
    /^(上午|早上|凌晨)\s*(\d{1,2}):(\d{2})$/,
    /^(下午|中午)\s*(\d{1,2}):(\d{2})$/,
    /^(晚上|夜间)\s*(\d{1,2}):(\d{2})$/,
    /^(\d{1,2}):(\d{2})\s*(AM|am)$/,
    /^(\d{1,2}):(\d{2})\s*(PM|pm)$/,
    /^(\d{1,2}):(\d{2})$/,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let hours = 0;
      let minutes = 0;

      if (match[1] === '上午' || match[1] === '早上' || match[1] === '凌晨') {
        hours = parseInt(match[2]);
        minutes = parseInt(match[3]);
      } else if (match[1] === '下午' || match[1] === '中午') {
        hours = parseInt(match[2]) + (parseInt(match[2]) === 12 ? 0 : 12);
        minutes = parseInt(match[3]);
      } else if (match[1] === '晚上' || match[1] === '夜间') {
        hours = parseInt(match[2]) + (parseInt(match[2]) === 12 ? 0 : 12);
        minutes = parseInt(match[3]);
      } else if (match[3] && (match[3] === 'AM' || match[3] === 'am')) {
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
      } else if (match[3] && (match[3] === 'PM' || match[3] === 'pm')) {
        hours = parseInt(match[1]) + (parseInt(match[1]) === 12 ? 0 : 12);
        minutes = parseInt(match[2]);
      } else {
        // 24小时制
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
      }

      const result = new Date(baseDate);
      result.setHours(hours, minutes, 0, 0);
      return result;
    }
  }

  return null;
}

/**
 * 解析Markdown内容
 */
export function parseMarkdownToPlan(markdown: string, planDate?: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = markdown.split('\n');
  const baseDate = planDate || new Date();

  // 提取日期（如果有）
  const dateMatch = markdown.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (dateMatch) {
    baseDate.setFullYear(parseInt(dateMatch[1]));
    baseDate.setMonth(parseInt(dateMatch[2]) - 1);
    baseDate.setDate(parseInt(dateMatch[3]));
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 匹配时间段：上午 11:00 - 下午 2:30 (3小时)
    const timeRangeMatch = line.match(/^-\s*\*\*(.+?)\s*-\s*(.+?)\s*(?:\(.*?\))?:\*\*$/);

    if (timeRangeMatch) {
      const startTime = parseTime(timeRangeMatch[1], baseDate);
      const endTime = parseTime(timeRangeMatch[2], baseDate);

      if (startTime && endTime) {
        let title = '';
        let description = '';

        // 读取接下来几行获取详情
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j].trim();

          if (nextLine.startsWith('- **科目:**')) {
            title = nextLine.replace(/^- \*\*科目:\*\*\s*/, '').trim();
          } else if (nextLine.startsWith('- **活动:**')) {
            title = nextLine.replace(/^- \*\*活动:\*\*\s*/, '').trim();
          } else if (nextLine.startsWith('- **目标:**')) {
            description = nextLine.replace(/^- \*\*目标:\*\*\s*/, '').trim();
          }

          // 遇到下一个时间段就停止
          if (nextLine.startsWith('- **') && nextLine.includes(' - ')) {
            break;
          }
        }

        if (title) {
          events.push({
            id: `${startTime.getTime()}-${Math.random()}`,
            title,
            start: startTime,
            end: endTime,
            description,
          });
        }
      }
    }
  }

  return events;
}

/**
 * 从文件路径读取并解析
 */
export async function parseMarkdownFile(filePath: string): Promise<CalendarEvent[]> {
  try {
    const response = await fetch('/api/parse-markdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath }),
    });

    if (!response.ok) {
      throw new Error('Failed to parse file');
    }

    return await response.json();
  } catch (error) {
    console.error('Error parsing markdown file:', error);
    return [];
  }
}

/**
 * 快速示例：直接从文本创建
 */
export function quickParse(text: string): CalendarEvent[] {
  return parseMarkdownToPlan(text);
}
