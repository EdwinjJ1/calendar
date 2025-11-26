/**
 * AI Parser 单元测试
 * 测试 Markdown 日程解析功能
 */

import { parseMarkdownToPlan, parseMarkdownFile, quickParse } from '@/lib/aiParser';
import { mockUserInputs, boundaryConditions } from '../helpers/mockData';

// Mock fetch for parseMarkdownFile
global.fetch = jest.fn();

describe('aiParser', () => {
  const baseDate = new Date('2024-01-15T00:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseMarkdownToPlan - 时间格式解析', () => {
    describe('中文时间格式', () => {
      it('应该正确解析上午时间格式', () => {
        const markdown = `- **上午 11:00 - 下午 2:30 (3小时):**
  - **科目:** 数学
  - **目标:** 完成作业`;

        const events = parseMarkdownToPlan(markdown, new Date(baseDate));
        
        expect(events).toHaveLength(1);
        expect(events[0].title).toBe('数学');
        expect(events[0].start.getHours()).toBe(11);
        expect(events[0].start.getMinutes()).toBe(0);
        expect(events[0].end.getHours()).toBe(14);
        expect(events[0].end.getMinutes()).toBe(30);
      });

      it('应该正确解析早上时间格式', () => {
        const markdown = `- **早上 8:00 - 上午 10:00:**
  - **科目:** 英语
  - **目标:** 阅读练习`;

        const events = parseMarkdownToPlan(markdown, new Date(baseDate));
        
        expect(events).toHaveLength(1);
        expect(events[0].start.getHours()).toBe(8);
        expect(events[0].end.getHours()).toBe(10);
      });

      it('应该正确解析凌晨时间格式', () => {
        const markdown = `- **凌晨 5:30 - 上午 7:00:**
  - **科目:** 晨跑
  - **目标:** 5公里`;

        const events = parseMarkdownToPlan(markdown, new Date(baseDate));
        
        expect(events).toHaveLength(1);
        expect(events[0].start.getHours()).toBe(5);
        expect(events[0].start.getMinutes()).toBe(30);
      });

      it('应该正确解析下午时间格式', () => {
        const markdown = `- **下午 3:00 - 下午 5:00:**
  - **科目:** 物理
  - **目标:** 习题练习`;

        const events = parseMarkdownToPlan(markdown, new Date(baseDate));
        
        expect(events).toHaveLength(1);
        expect(events[0].start.getHours()).toBe(15);
        expect(events[0].end.getHours()).toBe(17);
      });

      it('应该正确解析中午时间格式', () => {
        const markdown = `- **中午 12:00 - 下午 1:00:**
  - **活动:** 午餐
  - **目标:** 休息`;

        const events = parseMarkdownToPlan(markdown, new Date(baseDate));
        
        expect(events).toHaveLength(1);
        expect(events[0].title).toBe('午餐');
        expect(events[0].start.getHours()).toBe(12);
      });

      it('应该正确解析晚上时间格式', () => {
        const markdown = `- **晚上 8:00 - 晚上 10:00:**
  - **科目:** 复习
  - **目标:** 总结笔记`;

        const events = parseMarkdownToPlan(markdown, new Date(baseDate));
        
        expect(events).toHaveLength(1);
        expect(events[0].start.getHours()).toBe(20);
        expect(events[0].end.getHours()).toBe(22);
      });

      it('应该正确解析夜间时间格式', () => {
        const markdown = `- **夜间 11:00 - 凌晨 12:00:**
  - **科目:** 阅读
  - **目标:** 睡前阅读`;

        const events = parseMarkdownToPlan(markdown, new Date(baseDate));

        expect(events).toHaveLength(1);
        expect(events[0].start.getHours()).toBe(23);
      });

      it('应该正确处理晚上12点(午夜)', () => {
        const markdown = `- **晚上 12:00 - 凌晨 1:00:**
  - **科目:** 午夜活动
  - **目标:** 测试12点边界`;

        const events = parseMarkdownToPlan(markdown, new Date(baseDate));

        expect(events).toHaveLength(1);
        expect(events[0].start.getHours()).toBe(12);
      });
    });

    describe('英文时间格式', () => {
      it('应该正确解析AM时间格式', () => {
        const markdown = `- **9:00 AM - 11:00 AM:**
  - **科目:** Morning Study
  - **目标:** Read chapter 5`;

        const events = parseMarkdownToPlan(markdown, new Date(baseDate));
        
        expect(events).toHaveLength(1);
        expect(events[0].start.getHours()).toBe(9);
        expect(events[0].end.getHours()).toBe(11);
      });

      it('应该正确解析PM时间格式', () => {
        const markdown = `- **2:30 PM - 4:00 PM:**
  - **科目:** Afternoon Session
  - **目标:** Practice problems`;

        const events = parseMarkdownToPlan(markdown, new Date(baseDate));
        
        expect(events).toHaveLength(1);
        expect(events[0].start.getHours()).toBe(14);
        expect(events[0].start.getMinutes()).toBe(30);
        expect(events[0].end.getHours()).toBe(16);
      });

      it('应该正确解析小写am/pm格式', () => {
        const markdown = `- **10:00 am - 12:00 pm:**
  - **科目:** Lecture
  - **目标:** Take notes`;

        const events = parseMarkdownToPlan(markdown, new Date(baseDate));
        
        expect(events).toHaveLength(1);
        expect(events[0].start.getHours()).toBe(10);
        expect(events[0].end.getHours()).toBe(12);
      });
    });

    describe('24小时制时间格式', () => {
      it('应该正确解析24小时制时间', () => {
        const markdown = `- **14:30 - 16:00:**
  - **科目:** 下午课程
  - **目标:** 专注学习`;

        const events = parseMarkdownToPlan(markdown, new Date(baseDate));

        expect(events).toHaveLength(1);
        expect(events[0].start.getHours()).toBe(14);
        expect(events[0].start.getMinutes()).toBe(30);
        expect(events[0].end.getHours()).toBe(16);
      });
    });
  });

  describe('parseMarkdownToPlan - 日期解析', () => {
    it('应该从Markdown中提取中文日期格式', () => {
      const markdown = `# 2024年3月20日 学习计划

- **上午 9:00 - 上午 11:00:**
  - **科目:** 数学
  - **目标:** 复习`;

      const events = parseMarkdownToPlan(markdown);

      expect(events).toHaveLength(1);
      expect(events[0].start.getFullYear()).toBe(2024);
      expect(events[0].start.getMonth()).toBe(2); // March = 2
      expect(events[0].start.getDate()).toBe(20);
    });

    it('应该在没有日期时使用提供的planDate', () => {
      const markdown = `- **上午 10:00 - 上午 11:00:**
  - **科目:** 测试
  - **目标:** 验证`;

      const planDate = new Date('2025-06-15T00:00:00.000Z');
      const events = parseMarkdownToPlan(markdown, planDate);

      expect(events).toHaveLength(1);
      expect(events[0].start.getFullYear()).toBe(2025);
      expect(events[0].start.getMonth()).toBe(5); // June = 5
      expect(events[0].start.getDate()).toBe(15);
    });

    it('应该在没有日期和planDate时使用当前日期', () => {
      const markdown = `- **上午 10:00 - 上午 11:00:**
  - **科目:** 测试
  - **目标:** 验证`;

      const events = parseMarkdownToPlan(markdown);
      const today = new Date();

      expect(events).toHaveLength(1);
      expect(events[0].start.getFullYear()).toBe(today.getFullYear());
    });
  });

  describe('parseMarkdownToPlan - 多事件解析', () => {
    it('应该正确解析多个时间段', () => {
      const markdown = `# 2024年1月15日 学习计划

- **上午 9:00 - 上午 11:00:**
  - **科目:** 数学
  - **目标:** 复习第一章

- **下午 2:00 - 下午 4:00:**
  - **科目:** 英语
  - **目标:** 阅读练习

- **晚上 7:00 - 晚上 9:00:**
  - **科目:** 物理
  - **目标:** 习题`;

      const events = parseMarkdownToPlan(markdown);

      expect(events).toHaveLength(3);
      expect(events[0].title).toBe('数学');
      expect(events[1].title).toBe('英语');
      expect(events[2].title).toBe('物理');
    });

    it('应该正确解析活动类型的事件', () => {
      const markdown = `- **上午 8:00 - 上午 9:00:**
  - **活动:** 晨跑
  - **目标:** 5公里`;

      const events = parseMarkdownToPlan(markdown, new Date(baseDate));

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('晨跑');
      expect(events[0].description).toBe('5公里');
    });
  });

  describe('parseMarkdownToPlan - 边界条件', () => {
    it('应该处理空字符串输入', () => {
      const events = parseMarkdownToPlan('');
      expect(events).toHaveLength(0);
    });

    it('应该处理只有空白的输入', () => {
      const events = parseMarkdownToPlan('   \n   \n   ');
      expect(events).toHaveLength(0);
    });

    it('应该处理没有时间段的Markdown', () => {
      const markdown = `# 这是一个标题

这是一些普通文本，没有日程信息。

- 普通列表项
- 另一个列表项`;

      const events = parseMarkdownToPlan(markdown);
      expect(events).toHaveLength(0);
    });

    it('应该处理无效的时间格式', () => {
      const markdown = `- **无效时间 - 另一个无效时间:**
  - **科目:** 测试
  - **目标:** 验证`;

      const events = parseMarkdownToPlan(markdown);
      expect(events).toHaveLength(0);
    });

    it('应该跳过没有标题的时间段', () => {
      const markdown = `- **上午 9:00 - 上午 10:00:**
  - **目标:** 只有目标没有科目`;

      const events = parseMarkdownToPlan(markdown, new Date(baseDate));
      expect(events).toHaveLength(0);
    });

    it('应该处理包含特殊字符的输入', () => {
      const markdown = `- **上午 9:00 - 上午 10:00:**
  - **科目:** 测试 <script>alert('xss')</script>
  - **目标:** 📅 验证 ✨`;

      const events = parseMarkdownToPlan(markdown, new Date(baseDate));

      expect(events).toHaveLength(1);
      expect(events[0].title).toContain('测试');
    });

    it('应该正确生成唯一ID', () => {
      const markdown = `- **上午 9:00 - 上午 10:00:**
  - **科目:** 事件1

- **上午 11:00 - 上午 12:00:**
  - **科目:** 事件2`;

      const events = parseMarkdownToPlan(markdown, new Date(baseDate));

      expect(events).toHaveLength(2);
      expect(events[0].id).not.toBe(events[1].id);
    });
  });

  describe('parseMarkdownFile', () => {
    it('应该成功获取并解析远程Markdown文件', async () => {
      const mockResponse = [
        { id: '1', title: 'Event 1', start: new Date(), end: new Date() }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await parseMarkdownFile('/path/to/file.md');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/parse-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: '/path/to/file.md' }),
      });
    });

    it('应该在API响应失败时返回空数组', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await parseMarkdownFile('/path/to/file.md');

      expect(result).toEqual([]);
    });

    it('应该在网络错误时返回空数组', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await parseMarkdownFile('/path/to/file.md');

      expect(result).toEqual([]);
    });
  });

  describe('quickParse', () => {
    it('应该直接调用parseMarkdownToPlan', () => {
      const markdown = `- **上午 9:00 - 上午 10:00:**
  - **科目:** 快速解析测试
  - **目标:** 验证功能`;

      const events = quickParse(markdown);

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('快速解析测试');
    });

    it('应该处理空输入', () => {
      const events = quickParse('');
      expect(events).toHaveLength(0);
    });
  });

  describe('parseMarkdownToPlan - 12点边界情况', () => {
    it('应该正确处理下午12点(中午)', () => {
      const markdown = `- **下午 12:00 - 下午 1:00:**
  - **科目:** 午餐会议
  - **目标:** 讨论项目`;

      const events = parseMarkdownToPlan(markdown, new Date(baseDate));

      expect(events).toHaveLength(1);
      expect(events[0].start.getHours()).toBe(12);
    });

    it('应该正确处理12:00 PM', () => {
      const markdown = `- **12:00 PM - 1:00 PM:**
  - **科目:** Lunch Meeting
  - **目标:** Team sync`;

      const events = parseMarkdownToPlan(markdown, new Date(baseDate));

      expect(events).toHaveLength(1);
      expect(events[0].start.getHours()).toBe(12);
    });
  });
});

