/**
 * 边界条件和错误处理单元测试
 * 测试各种边界情况和异常场景
 */

import { parseMarkdownToPlan } from '@/lib/aiParser';
import { eventStorage, todoStorage } from '@/lib/storage';
import { boundaryConditions, createMockEvent } from '../helpers/mockData';
import type { CalendarEvent, TodoItem } from '@/types';

describe('边界条件测试', () => {
  describe('空输入处理', () => {
    it('parseMarkdownToPlan 应该处理空字符串', () => {
      const result = parseMarkdownToPlan('');
      expect(result).toEqual([]);
    });

    it('parseMarkdownToPlan 应该处理只有空白字符的输入', () => {
      const result = parseMarkdownToPlan('   \t\n   ');
      expect(result).toEqual([]);
    });

    it('parseMarkdownToPlan 应该处理只有换行符的输入', () => {
      const result = parseMarkdownToPlan('\n\n\n');
      expect(result).toEqual([]);
    });
  });

  describe('极端日期处理', () => {
    it('应该处理非常早的日期 (1900年)', () => {
      const markdown = `# 1900年1月1日 历史事件

- **上午 10:00 - 上午 11:00:**
  - **科目:** 历史事件
  - **目标:** 记录`;

      const events = parseMarkdownToPlan(markdown);
      
      expect(events).toHaveLength(1);
      expect(events[0].start.getFullYear()).toBe(1900);
    });

    it('应该处理很远的未来日期 (2099年)', () => {
      const markdown = `# 2099年12月31日 未来计划

- **上午 10:00 - 上午 11:00:**
  - **科目:** 未来计划
  - **目标:** 规划`;

      const events = parseMarkdownToPlan(markdown);
      
      expect(events).toHaveLength(1);
      expect(events[0].start.getFullYear()).toBe(2099);
    });

    it('应该处理闰年日期', () => {
      const markdown = `# 2024年2月29日 闰年

- **上午 10:00 - 上午 11:00:**
  - **科目:** 闰年测试
  - **目标:** 验证`;

      const events = parseMarkdownToPlan(markdown);
      
      expect(events).toHaveLength(1);
      expect(events[0].start.getMonth()).toBe(1); // February
      expect(events[0].start.getDate()).toBe(29);
    });
  });

  describe('特殊字符处理', () => {
    it('应该处理Unicode字符', () => {
      const markdown = `- **上午 10:00 - 上午 11:00:**
  - **科目:** 日程📅 中文测试 🎉
  - **目标:** ✨ 验证Unicode支持`;

      const events = parseMarkdownToPlan(markdown, new Date('2024-01-15'));
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toContain('📅');
      expect(events[0].description).toContain('✨');
    });

    it('应该处理HTML实体字符', () => {
      const markdown = `- **上午 10:00 - 上午 11:00:**
  - **科目:** Test &amp; Verify &lt;script&gt;
  - **目标:** Check &quot;special&quot; chars`;

      const events = parseMarkdownToPlan(markdown, new Date('2024-01-15'));
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toContain('&amp;');
    });

    it('应该处理潜在的XSS输入', () => {
      const markdown = `- **上午 10:00 - 上午 11:00:**
  - **科目:** <script>alert('xss')</script>
  - **目标:** Test XSS prevention`;

      const events = parseMarkdownToPlan(markdown, new Date('2024-01-15'));
      
      expect(events).toHaveLength(1);
      // 应该保持原样，由前端渲染时处理转义
      expect(events[0].title).toContain('<script>');
    });

    it('应该处理SQL注入模式输入', () => {
      const markdown = `- **上午 10:00 - 上午 11:00:**
  - **科目:** Robert'; DROP TABLE events;--
  - **目标:** SQL injection test`;

      const events = parseMarkdownToPlan(markdown, new Date('2024-01-15'));
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toContain('DROP TABLE');
    });

    it('应该处理非常长的输入', () => {
      const longTitle = 'A'.repeat(1000);
      const markdown = `- **上午 10:00 - 上午 11:00:**
  - **科目:** ${longTitle}
  - **目标:** Long text test`;

      const events = parseMarkdownToPlan(markdown, new Date('2024-01-15'));
      
      expect(events).toHaveLength(1);
      expect(events[0].title.length).toBe(1000);
    });
  });

  describe('时间边界处理', () => {
    it('应该处理午夜边界 (00:00)', () => {
      const markdown = `- **0:00 - 1:00:**
  - **科目:** 午夜任务
  - **目标:** 深夜工作`;

      const events = parseMarkdownToPlan(markdown, new Date('2024-01-15'));
      
      expect(events).toHaveLength(1);
      expect(events[0].start.getHours()).toBe(0);
    });

    it('应该处理一天结束边界 (23:59)', () => {
      const markdown = `- **23:00 - 23:59:**
  - **科目:** 深夜任务
  - **目标:** 一天结束`;

      const events = parseMarkdownToPlan(markdown, new Date('2024-01-15'));

      expect(events).toHaveLength(1);
      expect(events[0].start.getHours()).toBe(23);
      expect(events[0].end.getMinutes()).toBe(59);
    });
  });

  describe('Storage 边界条件', () => {
    let localStorageMock: {
      getItem: jest.Mock;
      setItem: jest.Mock;
      removeItem: jest.Mock;
      clear: jest.Mock;
    };

    beforeEach(() => {
      localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });
    });

    it('应该处理损坏的JSON数据', () => {
      localStorageMock.getItem.mockReturnValue('{"broken": json');

      const events = eventStorage.getAll();
      expect(events).toEqual([]);
    });

    it('应该处理非数组的JSON数据', () => {
      localStorageMock.getItem.mockReturnValue('{"not": "an array"}');

      // 当存储的数据不是数组时，map操作会失败
      // 这是一个边界情况，测试当前实现的行为
      expect(() => eventStorage.getAll()).toThrow();
    });

    it('应该处理undefined localStorage值', () => {
      localStorageMock.getItem.mockReturnValue(undefined);

      const events = eventStorage.getAll();
      expect(events).toEqual([]);
    });

    it('应该处理超大数据集', () => {
      const largeDataSet: any[] = [];
      for (let i = 0; i < 1000; i++) {
        largeDataSet.push({
          id: `event-${i}`,
          title: `Event ${i}`,
          start: '2024-01-15T10:00:00.000Z',
          end: '2024-01-15T11:00:00.000Z',
        });
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(largeDataSet));

      const events = eventStorage.getAll();
      expect(events).toHaveLength(1000);
    });
  });

  describe('日期格式边界条件', () => {
    it('应该处理无效的月份 (13月)', () => {
      const markdown = `# 2024年13月1日

- **上午 10:00 - 上午 11:00:**
  - **科目:** 无效月份测试
  - **目标:** 验证`;

      const events = parseMarkdownToPlan(markdown);

      // JavaScript Date 会自动进位到下一年的1月
      expect(events).toHaveLength(1);
    });

    it('应该处理无效的日期 (2月30日)', () => {
      const markdown = `# 2024年2月30日

- **上午 10:00 - 上午 11:00:**
  - **科目:** 无效日期测试
  - **目标:** 验证`;

      const events = parseMarkdownToPlan(markdown);

      // JavaScript Date 会自动调整
      expect(events).toHaveLength(1);
    });
  });

  describe('并发和竞态条件', () => {
    let localStorageMock: {
      getItem: jest.Mock;
      setItem: jest.Mock;
      removeItem: jest.Mock;
      clear: jest.Mock;
    };

    beforeEach(() => {
      localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });
    });

    it('应该处理多次快速保存操作', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'Test',
          start: new Date(),
          end: new Date(),
        },
      ];

      // 模拟多次快速保存
      for (let i = 0; i < 10; i++) {
        eventStorage.save(events);
      }

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(10);
    });

    it('应该处理读写交替操作', () => {
      localStorageMock.getItem.mockReturnValue('[]');

      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'Test',
          start: new Date(),
          end: new Date(),
        },
      ];

      // 模拟读写交替
      eventStorage.getAll();
      eventStorage.save(events);
      eventStorage.getAll();
      eventStorage.save(events);

      expect(localStorageMock.getItem).toHaveBeenCalledTimes(2);
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    });
  });
});

