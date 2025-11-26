/**
 * ICS Export 模块单元测试
 * 测试日历事件导出功能
 */

import { exportEvents, exportTodos } from '@/lib/icsExport';
import { createMockEvent, createMockEvents } from '../helpers/mockData';
import type { CalendarEvent, TodoItem } from '@/types';

// Mock the download function
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

beforeEach(() => {
  // Mock URL.createObjectURL
  global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
  global.URL.revokeObjectURL = jest.fn();

  // Mock document methods for download
  const mockLink = {
    href: '',
    download: '',
    click: mockClick,
    style: {},
  };
  
  mockCreateElement.mockReturnValue(mockLink);
  document.createElement = mockCreateElement;
  document.body.appendChild = mockAppendChild;
  document.body.removeChild = mockRemoveChild;
});

describe('icsExport', () => {
  describe('exportEvents', () => {
    it('应该成功导出单个事件', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'Test Event',
          start: new Date('2024-01-15T10:00:00.000Z'),
          end: new Date('2024-01-15T11:00:00.000Z'),
          description: 'Test description',
          location: 'Test location',
          allDay: false,
        },
      ];

      expect(() => exportEvents(events)).not.toThrow();
      expect(mockClick).toHaveBeenCalled();
    });

    it('应该使用默认文件名', () => {
      const events = createMockEvents(1);
      
      exportEvents(events);
      
      const linkElement = mockCreateElement.mock.results[0].value;
      expect(linkElement.download).toBe('calendar.ics');
    });

    it('应该使用自定义文件名', () => {
      const events = createMockEvents(1);
      
      exportEvents(events, 'my-calendar.ics');
      
      const linkElement = mockCreateElement.mock.results[0].value;
      expect(linkElement.download).toBe('my-calendar.ics');
    });

    it('应该成功导出多个事件', () => {
      const events = createMockEvents(5);
      
      expect(() => exportEvents(events)).not.toThrow();
      expect(mockClick).toHaveBeenCalled();
    });

    it('应该处理空事件数组', () => {
      const events: CalendarEvent[] = [];
      
      expect(() => exportEvents(events)).not.toThrow();
    });

    it('应该处理全天事件', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'All Day Event',
          start: new Date('2024-01-15T00:00:00.000Z'),
          end: new Date('2024-01-15T23:59:59.000Z'),
          allDay: true,
        },
      ];

      expect(() => exportEvents(events)).not.toThrow();
    });

    it('应该处理没有可选字段的事件', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'Minimal Event',
          start: new Date('2024-01-15T10:00:00.000Z'),
          end: new Date('2024-01-15T11:00:00.000Z'),
        },
      ];

      expect(() => exportEvents(events)).not.toThrow();
    });

    it('应该处理包含特殊字符的事件', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'Event with 特殊字符 & symbols <>"',
          start: new Date('2024-01-15T10:00:00.000Z'),
          end: new Date('2024-01-15T11:00:00.000Z'),
          description: 'Description with emoji 📅 and newlines\nLine 2',
        },
      ];

      expect(() => exportEvents(events)).not.toThrow();
    });
  });

  describe('exportTodos', () => {
    it('应该成功导出待办事项', () => {
      const todos: TodoItem[] = [
        {
          id: 'todo-1',
          title: 'Test Todo',
          completed: false,
          createdAt: new Date('2024-01-15T10:00:00.000Z'),
          dueDate: new Date('2024-01-20T10:00:00.000Z'),
          priority: 'high',
          categories: ['work'],
        },
      ];

      expect(() => exportTodos(todos)).not.toThrow();
    });

    it('应该使用默认文件名', () => {
      const todos: TodoItem[] = [
        {
          id: 'todo-1',
          title: 'Test Todo',
          completed: false,
          createdAt: new Date(),
          priority: 'medium',
          categories: [],
        },
      ];

      exportTodos(todos);

      const linkElement = mockCreateElement.mock.results[0].value;
      expect(linkElement.download).toBe('todos.ics');
    });

    it('应该使用自定义文件名', () => {
      const todos: TodoItem[] = [
        {
          id: 'todo-1',
          title: 'Test Todo',
          completed: false,
          createdAt: new Date(),
          priority: 'low',
          categories: [],
        },
      ];

      exportTodos(todos, 'my-todos.ics');

      const linkElement = mockCreateElement.mock.results[0].value;
      expect(linkElement.download).toBe('my-todos.ics');
    });

    it('应该处理空待办事项数组', () => {
      const todos: TodoItem[] = [];

      expect(() => exportTodos(todos)).not.toThrow();
    });

    it('应该处理没有dueDate的待办事项', () => {
      const todos: TodoItem[] = [
        {
          id: 'todo-1',
          title: 'Todo without due date',
          completed: false,
          createdAt: new Date('2024-01-15T10:00:00.000Z'),
          priority: 'medium',
          categories: ['personal'],
        },
      ];

      expect(() => exportTodos(todos)).not.toThrow();
    });

    it('应该处理多个分类的待办事项', () => {
      const todos: TodoItem[] = [
        {
          id: 'todo-1',
          title: 'Multi-category todo',
          completed: true,
          createdAt: new Date(),
          priority: 'high',
          categories: ['work', 'urgent', 'meeting'],
        },
      ];

      expect(() => exportTodos(todos)).not.toThrow();
    });
  });
});

