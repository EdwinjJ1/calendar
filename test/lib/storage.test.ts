/**
 * Storage 模块单元测试
 * 测试日历事件和待办事项的存储功能
 */

import { eventStorage, todoStorage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { createMockEvent, createMockEvents } from '../helpers/mockData';
import type { CalendarEvent, TodoItem } from '@/types';

describe('storage', () => {
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
    jest.clearAllMocks();
  });

  describe('eventStorage', () => {
    describe('getAll', () => {
      it('应该返回空数组当localStorage为空时', () => {
        localStorageMock.getItem.mockReturnValue(null);
        
        const events = eventStorage.getAll();
        
        expect(events).toEqual([]);
        expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEYS.EVENTS);
      });

      it('应该正确解析存储的事件并转换日期', () => {
        const storedEvents = [
          {
            id: 'event-1',
            title: 'Test Event',
            start: '2024-01-15T10:00:00.000Z',
            end: '2024-01-15T11:00:00.000Z',
            description: 'Description',
          },
        ];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(storedEvents));
        
        const events = eventStorage.getAll();
        
        expect(events).toHaveLength(1);
        expect(events[0].id).toBe('event-1');
        expect(events[0].title).toBe('Test Event');
        expect(events[0].start).toBeInstanceOf(Date);
        expect(events[0].end).toBeInstanceOf(Date);
      });

      it('应该正确处理多个事件', () => {
        const storedEvents = [
          {
            id: 'event-1',
            title: 'Event 1',
            start: '2024-01-15T10:00:00.000Z',
            end: '2024-01-15T11:00:00.000Z',
          },
          {
            id: 'event-2',
            title: 'Event 2',
            start: '2024-01-15T14:00:00.000Z',
            end: '2024-01-15T15:00:00.000Z',
          },
        ];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(storedEvents));
        
        const events = eventStorage.getAll();
        
        expect(events).toHaveLength(2);
        expect(events[0].title).toBe('Event 1');
        expect(events[1].title).toBe('Event 2');
      });

      it('应该在JSON解析失败时返回空数组', () => {
        localStorageMock.getItem.mockReturnValue('invalid json');
        
        const events = eventStorage.getAll();
        
        expect(events).toEqual([]);
      });
    });

    describe('save', () => {
      it('应该正确保存事件并转换日期为ISO字符串', () => {
        const events: CalendarEvent[] = [
          {
            id: 'event-1',
            title: 'Test Event',
            start: new Date('2024-01-15T10:00:00.000Z'),
            end: new Date('2024-01-15T11:00:00.000Z'),
            description: 'Description',
          },
        ];

        eventStorage.save(events);

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          STORAGE_KEYS.EVENTS,
          expect.any(String)
        );

        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        // 验证日期已转换为字符串格式(formatISO会根据时区返回不同格式)
        expect(typeof savedData[0].start).toBe('string');
        expect(typeof savedData[0].end).toBe('string');
        // 验证可以解析回Date对象
        expect(new Date(savedData[0].start).getTime()).toBe(events[0].start.getTime());
        expect(new Date(savedData[0].end).getTime()).toBe(events[0].end.getTime());
      });

      it('应该保存空数组', () => {
        eventStorage.save([]);
        
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          STORAGE_KEYS.EVENTS,
          '[]'
        );
      });

      it('应该处理包含可选字段的事件', () => {
        const events: CalendarEvent[] = [
          {
            id: 'event-1',
            title: 'Complete Event',
            start: new Date('2024-01-15T10:00:00.000Z'),
            end: new Date('2024-01-15T11:00:00.000Z'),
            description: 'Description',
            location: 'Conference Room',
            allDay: false,
          },
        ];
        
        eventStorage.save(events);
        
        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(savedData[0].description).toBe('Description');
        expect(savedData[0].location).toBe('Conference Room');
        expect(savedData[0].allDay).toBe(false);
      });

      it('应该在localStorage抛出异常时不崩溃', () => {
        localStorageMock.setItem.mockImplementation(() => {
          throw new Error('Storage quota exceeded');
        });

        const events = createMockEvents(1);

        // Should not throw
        expect(() => eventStorage.save(events)).not.toThrow();
      });
    });
  });

  describe('todoStorage', () => {
    describe('getAll', () => {
      it('应该返回空数组当localStorage为空时', () => {
        localStorageMock.getItem.mockReturnValue(null);

        const todos = todoStorage.getAll();

        expect(todos).toEqual([]);
        expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEYS.TODOS);
      });

      it('应该正确解析存储的待办事项并转换日期', () => {
        const storedTodos = [
          {
            id: 'todo-1',
            title: 'Test Todo',
            completed: false,
            createdAt: '2024-01-15T10:00:00.000Z',
            dueDate: '2024-01-20T10:00:00.000Z',
            priority: 'medium',
            categories: ['work'],
          },
        ];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(storedTodos));

        const todos = todoStorage.getAll();

        expect(todos).toHaveLength(1);
        expect(todos[0].createdAt).toBeInstanceOf(Date);
        expect(todos[0].dueDate).toBeInstanceOf(Date);
      });

      it('应该处理没有dueDate的待办事项', () => {
        const storedTodos = [
          {
            id: 'todo-1',
            title: 'Todo without due date',
            completed: false,
            createdAt: '2024-01-15T10:00:00.000Z',
            priority: 'low',
            categories: [],
          },
        ];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(storedTodos));

        const todos = todoStorage.getAll();

        expect(todos).toHaveLength(1);
        expect(todos[0].dueDate).toBeUndefined();
      });

      it('应该在JSON解析失败时返回空数组', () => {
        localStorageMock.getItem.mockReturnValue('invalid json');

        const todos = todoStorage.getAll();

        expect(todos).toEqual([]);
      });
    });

    describe('save', () => {
      it('应该正确保存待办事项并转换日期', () => {
        const todos: TodoItem[] = [
          {
            id: 'todo-1',
            title: 'Test Todo',
            completed: false,
            createdAt: new Date('2024-01-15T10:00:00.000Z'),
            dueDate: new Date('2024-01-20T10:00:00.000Z'),
            priority: 'high',
            categories: ['work', 'urgent'],
          },
        ];

        todoStorage.save(todos);

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          STORAGE_KEYS.TODOS,
          expect.any(String)
        );

        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        // 验证日期已转换为字符串格式
        expect(typeof savedData[0].createdAt).toBe('string');
        expect(typeof savedData[0].dueDate).toBe('string');
        // 验证可以解析回Date对象
        expect(new Date(savedData[0].createdAt).getTime()).toBe(todos[0].createdAt.getTime());
        expect(new Date(savedData[0].dueDate!).getTime()).toBe(todos[0].dueDate!.getTime());
      });

      it('应该正确处理没有dueDate的待办事项', () => {
        const todos: TodoItem[] = [
          {
            id: 'todo-1',
            title: 'Test Todo',
            completed: false,
            createdAt: new Date('2024-01-15T10:00:00.000Z'),
            priority: 'low',
            categories: [],
          },
        ];

        todoStorage.save(todos);

        const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(savedData[0].dueDate).toBeUndefined();
      });

      it('应该在localStorage抛出异常时不崩溃', () => {
        localStorageMock.setItem.mockImplementation(() => {
          throw new Error('Storage quota exceeded');
        });

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

        expect(() => todoStorage.save(todos)).not.toThrow();
      });
    });
  });
});

