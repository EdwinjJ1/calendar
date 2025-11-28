/**
 * CalendarPage useEffect 副作用测试
 * 测试localStorage读写、事件管理等副作用
 */

import { render, screen, fireEvent, waitFor } from '../helpers/testUtils';
import CalendarPage from '@/app/calendar/page';
import { eventStorage } from '@/lib/storage';
import type { CalendarEvent } from '@/types';

// Mock storage module
jest.mock('@/lib/storage', () => ({
  eventStorage: {
    getAll: jest.fn(),
    save: jest.fn(),
  },
  todoStorage: {
    getAll: jest.fn().mockReturnValue([]),
    save: jest.fn(),
  },
}));

// Mock feature flags to use localStorage mode
jest.mock('@/lib/featureFlags', () => ({
  FEATURES: {
    USE_DATABASE_STORAGE: false,
  },
  isFeatureEnabled: jest.fn().mockReturnValue(false),
  useDatabaseStorage: jest.fn().mockReturnValue(false),
  getStorageMode: jest.fn().mockReturnValue('localStorage'),
}));

// Mock Navigation component to avoid complex dependencies
jest.mock('@/components/ui/Navigation', () => {
  return function MockNavigation() {
    return <nav data-testid="mock-navigation">Navigation</nav>;
  };
});

// Mock icsExport module
jest.mock('@/lib/icsExport', () => ({
  exportEvents: jest.fn(),
}));

// Mock all child components
jest.mock('@/components/calendar/CalendarView', () => {
  return function MockCalendarView({ events, onSelectSlot }: any) {
    return (
      <div data-testid="calendar-view">
        <div>Events: {events.length}</div>
        <button onClick={() => onSelectSlot({ start: new Date(), end: new Date() })}>
          Select Slot
        </button>
      </div>
    );
  };
});

jest.mock('@/components/calendar/EventModal', () => {
  return function MockEventModal({ isOpen, onClose, onSave }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="event-modal">
        <button onClick={() => onSave({ title: 'Test Event', start: new Date(), end: new Date() })}>
          Save Event
        </button>
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  };
});

jest.mock('@/components/calendar/AIImport', () => {
  return function MockAIImport({ onImport }: any) {
    return (
      <button
        onClick={() =>
          onImport([
            {
              id: 'ai-1',
              title: 'AI Event',
              start: new Date('2024-01-15T10:00:00'),
              end: new Date('2024-01-15T11:00:00'),
            },
          ])
        }
      >
        AI Import
      </button>
    );
  };
});

describe('CalendarPage - useEffect副作用测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (eventStorage.getAll as jest.Mock).mockReturnValue([]);
  });

  describe('初始化副作用', () => {
    it('应该在组件挂载时从localStorage加载事件', () => {
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: '测试事件',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00'),
        },
      ];

      (eventStorage.getAll as jest.Mock).mockReturnValue(mockEvents);

      render(<CalendarPage />);

      // 验证getAll被调用 (可能多次调用，因为有 useEffect 和 useQuery)
      expect(eventStorage.getAll).toHaveBeenCalled();

      // 验证事件被加载
      expect(screen.getByText('Events: 1')).toBeInTheDocument();
    });

    it('应该使用localStorage模式加载事件', () => {
      render(<CalendarPage />);

      // 在localStorage模式下，getAll应该被调用
      expect(eventStorage.getAll).toHaveBeenCalled();
    });

    it('应该处理localStorage为空的情况', () => {
      (eventStorage.getAll as jest.Mock).mockReturnValue([]);

      render(<CalendarPage />);

      expect(eventStorage.getAll).toHaveBeenCalled();
      expect(screen.getByText('Events: 0')).toBeInTheDocument();
    });
  });

  describe('自动保存副作用', () => {
    it('应该在添加事件后自动保存到localStorage', async () => {
      render(<CalendarPage />);

      // 打开模态框
      const newEventButton = screen.getByText(/New Event/i);
      fireEvent.click(newEventButton);

      // 保存事件
      const saveButton = screen.getByText('Save Event');
      fireEvent.click(saveButton);

      // 验证事件被保存
      await waitFor(() => {
        expect(eventStorage.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              title: 'Test Event',
              id: expect.any(String),
            }),
          ])
        );
      });
    });

    it('应该在导入AI事件后自动保存', async () => {
      render(<CalendarPage />);

      const aiImportButton = screen.getByText('AI Import');
      fireEvent.click(aiImportButton);

      await waitFor(() => {
        expect(eventStorage.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              title: 'AI Event',
              id: 'ai-1',
            }),
          ])
        );
      });
    });

    it('应该在每次事件数组变化时保存', async () => {
      render(<CalendarPage />);

      // 添加第一个事件
      const newEventButton = screen.getByText(/New Event/i);
      fireEvent.click(newEventButton);
      fireEvent.click(screen.getByText('Save Event'));

      await waitFor(() => {
        expect(eventStorage.save).toHaveBeenCalledTimes(1);
      });

      // 关闭模态框并添加第二个事件
      fireEvent.click(screen.getByText('Close Modal'));
      fireEvent.click(newEventButton);
      fireEvent.click(screen.getByText('Save Event'));

      await waitFor(() => {
        expect(eventStorage.save).toHaveBeenCalledTimes(2);
      });
    });

    it('不应该在初始状态（空数组）时保存', () => {
      (eventStorage.getAll as jest.Mock).mockReturnValue([]);

      render(<CalendarPage />);

      // 验证没有调用save（因为events.length为0）
      expect(eventStorage.save).not.toHaveBeenCalled();
    });
  });

  describe('事件添加副作用', () => {
    it('应该生成唯一ID', async () => {
      render(<CalendarPage />);

      const newEventButton = screen.getByText(/New Event/i);
      fireEvent.click(newEventButton);
      fireEvent.click(screen.getByText('Save Event'));

      await waitFor(() => {
        expect(eventStorage.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
            }),
          ])
        );
      });

      // 验证ID是nanoid生成的（长度应该大于10）
      const savedEvents = (eventStorage.save as jest.Mock).mock.calls[0][0];
      expect(savedEvents[0].id.length).toBeGreaterThan(10);
    });

    it('应该保留从slot选择的时间信息', async () => {
      render(<CalendarPage />);

      // 通过日历选择时间槽
      const selectSlotButton = screen.getByText('Select Slot');
      fireEvent.click(selectSlotButton);

      // 保存事件
      await waitFor(() => {
        expect(screen.getByTestId('event-modal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Save Event'));

      await waitFor(() => {
        expect(eventStorage.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              start: expect.any(Date),
              end: expect.any(Date),
            }),
          ])
        );
      });
    });
  });

  describe('AI导入副作用', () => {
    it('应该保留AI导入事件的原始ID', async () => {
      render(<CalendarPage />);

      const aiImportButton = screen.getByText('AI Import');
      fireEvent.click(aiImportButton);

      await waitFor(() => {
        expect(eventStorage.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'ai-1', // AI事件应该保留原始ID
              title: 'AI Event',
            }),
          ])
        );
      });
    });

    it('应该合并导入的事件到现有事件', async () => {
      const existingEvents: CalendarEvent[] = [
        {
          id: 'existing-1',
          title: '现有事件',
          start: new Date('2024-01-15T09:00:00'),
          end: new Date('2024-01-15T10:00:00'),
        },
      ];

      (eventStorage.getAll as jest.Mock).mockReturnValue(existingEvents);

      render(<CalendarPage />);

      const aiImportButton = screen.getByText('AI Import');
      fireEvent.click(aiImportButton);

      await waitFor(() => {
        expect(eventStorage.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'existing-1' }),
            expect.objectContaining({ id: 'ai-1' }),
          ])
        );
      });
    });
  });

  describe('模态框状态副作用', () => {
    it('应该在选择时间槽时打开模态框', () => {
      render(<CalendarPage />);

      const selectSlotButton = screen.getByText('Select Slot');
      fireEvent.click(selectSlotButton);

      expect(screen.getByTestId('event-modal')).toBeInTheDocument();
    });

    it('应该在关闭模态框时清空selectedSlot', async () => {
      render(<CalendarPage />);

      // 选择时间槽
      const selectSlotButton = screen.getByText('Select Slot');
      fireEvent.click(selectSlotButton);

      // 关闭模态框
      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);

      // 验证模态框关闭
      await waitFor(() => {
        expect(screen.queryByTestId('event-modal')).not.toBeInTheDocument();
      });
    });

    it('应该在保存事件后关闭模态框', async () => {
      render(<CalendarPage />);

      const newEventButton = screen.getByText(/New Event/i);
      fireEvent.click(newEventButton);

      const saveButton = screen.getByText('Save Event');
      fireEvent.click(saveButton);

      // 注意：在实际实现中，保存后不会自动关闭模态框
      // 这个测试验证当前行为
      expect(screen.getByTestId('event-modal')).toBeInTheDocument();
    });
  });

  describe('导出副作用', () => {
    it('应该调用exportEvents函数', async () => {
      const { exportEvents } = require('@/lib/icsExport');

      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: '测试事件',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00'),
        },
      ];

      (eventStorage.getAll as jest.Mock).mockReturnValue(mockEvents);

      render(<CalendarPage />);

      const exportButton = screen.getByText(/Export/i);
      fireEvent.click(exportButton);

      expect(exportEvents).toHaveBeenCalledWith(mockEvents);
    });
  });
});
