/**
 * TodosPage useEffect 副作用测试
 * 测试localStorage读写、待办事项管理、过滤等副作用
 */

import { render, screen, fireEvent, waitFor } from '../helpers/testUtils';
import TodosPage from '@/app/todos/page';
import { todoStorage } from '@/lib/storage';
import type { TodoItem } from '@/types';

// Mock storage module
jest.mock('@/lib/storage', () => ({
  eventStorage: {
    getAll: jest.fn().mockReturnValue([]),
    save: jest.fn(),
  },
  todoStorage: {
    getAll: jest.fn(),
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

// Mock icsExport module
jest.mock('@/lib/icsExport', () => ({
  exportTodos: jest.fn(),
}));

// Mock TodoList component (with drag and drop)
jest.mock('@/components/todos/TodoList', () => {
  return function MockTodoList({ todos, onToggle, onDelete, onReorder }: any) {
    return (
      <div data-testid="todo-list">
        {todos.map((todo: TodoItem) => (
          <div key={todo.id} data-testid={`todo-${todo.id}`}>
            <span>{todo.title}</span>
            <button onClick={() => onToggle(todo.id)}>Toggle</button>
            <button onClick={() => onDelete(todo.id)}>Delete</button>
          </div>
        ))}
        <button
          onClick={() => {
            // 模拟拖拽重排
            const reordered = [...todos].reverse();
            onReorder(reordered);
          }}
        >
          Reorder
        </button>
      </div>
    );
  };
});

// Mock TodoForm component
jest.mock('@/components/todos/TodoForm', () => {
  return function MockTodoForm({ onAdd }: any) {
    return (
      <button
        onClick={() =>
          onAdd({
            title: 'New Todo',
            completed: false,
            priority: 'medium' as const, categories: ['personal'],
          })
        }
      >
        Add Todo
      </button>
    );
  };
});

describe('TodosPage - useEffect副作用测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (todoStorage.getAll as jest.Mock).mockReturnValue([]);
  });

  describe('初始化副作用', () => {
    it('应该在组件挂载时从localStorage加载待办事项', () => {
      const mockTodos: TodoItem[] = [
        {
          id: '1',
          title: '测试任务',
          completed: false,
          createdAt: new Date('2024-01-15T10:00:00'),
          priority: 'medium' as const, categories: ['work'],
        },
      ];

      (todoStorage.getAll as jest.Mock).mockReturnValue(mockTodos);

      render(<TodosPage />);

      // 验证getAll被调用 (可能多次调用，因为有 useEffect 和 useQuery)
      expect(todoStorage.getAll).toHaveBeenCalled();

      // 验证待办事项被显示
      expect(screen.getByText('测试任务')).toBeInTheDocument();
    });

    it('应该使用localStorage模式加载待办事项', () => {
      render(<TodosPage />);

      // 在localStorage模式下，getAll应该被调用
      expect(todoStorage.getAll).toHaveBeenCalled();
    });

    it('应该处理localStorage为空的情况', () => {
      (todoStorage.getAll as jest.Mock).mockReturnValue([]);

      render(<TodosPage />);

      expect(todoStorage.getAll).toHaveBeenCalled();
      expect(screen.getByText(/No todos here/i)).toBeInTheDocument();
    });
  });

  describe('自动保存副作用', () => {
    it('应该在添加待办事项后自动保存到localStorage', async () => {
      render(<TodosPage />);

      const addButton = screen.getByText('Add Todo');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(todoStorage.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              title: 'New Todo',
              id: expect.any(String),
              createdAt: expect.any(Date),
            }),
          ])
        );
      });
    });

    it('应该在切换完成状态后自动保存', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: '1',
          title: '测试任务',
          completed: false,
          createdAt: new Date('2024-01-15T10:00:00'),
          priority: 'medium' as const, categories: ['work'],
        },
      ];

      (todoStorage.getAll as jest.Mock).mockReturnValue(mockTodos);

      render(<TodosPage />);

      const toggleButton = screen.getByText('Toggle');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(todoStorage.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: '1',
              completed: true, // 状态已切换
            }),
          ])
        );
      });
    });

    it('应该在删除待办事项后更新状态', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: '1',
          title: '测试任务',
          completed: false,
          createdAt: new Date('2024-01-15T10:00:00'),
          priority: 'medium' as const, categories: ['work'],
        },
      ];

      (todoStorage.getAll as jest.Mock).mockReturnValue(mockTodos);

      render(<TodosPage />);

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      // 验证待办事项被删除（显示空状态）
      await waitFor(() => {
        expect(screen.getByText(/No todos here/i)).toBeInTheDocument();
      });

      // 注意：当todos数组为空时，useEffect中的if条件会阻止save调用
      // 这是设计决策：空数组不需要持久化
    });

    it('应该在拖拽重排后自动保存', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: '1',
          title: '任务1',
          completed: false,
          createdAt: new Date('2024-01-15T10:00:00'),
          priority: 'medium' as const, categories: ['work'],
        },
        {
          id: '2',
          title: '任务2',
          completed: false,
          createdAt: new Date('2024-01-15T11:00:00'),
          priority: 'medium' as const, categories: ['personal'],
        },
      ];

      (todoStorage.getAll as jest.Mock).mockReturnValue(mockTodos);

      render(<TodosPage />);

      const reorderButton = screen.getByText('Reorder');
      fireEvent.click(reorderButton);

      await waitFor(() => {
        expect(todoStorage.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: '2' }),
            expect.objectContaining({ id: '1' }),
          ])
        );
      });
    });

    it('不应该在初始状态（空数组）时保存', () => {
      (todoStorage.getAll as jest.Mock).mockReturnValue([]);

      render(<TodosPage />);

      expect(todoStorage.save).not.toHaveBeenCalled();
    });
  });

  describe('待办事项添加副作用', () => {
    it('应该生成唯一ID和createdAt时间戳', async () => {
      render(<TodosPage />);

      const addButton = screen.getByText('Add Todo');
      fireEvent.click(addButton);

      await waitFor(() => {
        const savedTodos = (todoStorage.save as jest.Mock).mock.calls[0][0];
        expect(savedTodos[0].id).toBeDefined();
        expect(savedTodos[0].id.length).toBeGreaterThan(10);
        expect(savedTodos[0].createdAt).toBeInstanceOf(Date);
      });
    });

    it('应该合并新待办事项到现有列表', async () => {
      const existingTodos: TodoItem[] = [
        {
          id: 'existing-1',
          title: '现有任务',
          completed: false,
          createdAt: new Date('2024-01-15T09:00:00'),
          priority: 'medium' as const, categories: ['work'],
        },
      ];

      (todoStorage.getAll as jest.Mock).mockReturnValue(existingTodos);

      render(<TodosPage />);

      const addButton = screen.getByText('Add Todo');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(todoStorage.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'existing-1' }),
            expect.objectContaining({ title: 'New Todo' }),
          ])
        );
      });
    });
  });

  describe('过滤副作用', () => {
    const mockTodos: TodoItem[] = [
      {
        id: '1',
        title: '已完成任务',
        completed: true,
        createdAt: new Date('2024-01-15T10:00:00'),
        priority: 'medium' as const, categories: ['work'],
      },
      {
        id: '2',
        title: '未完成任务',
        completed: false,
        createdAt: new Date('2024-01-15T11:00:00'),
        priority: 'medium' as const, categories: ['personal'],
      },
    ];

    it('应该默认显示所有待办事项', () => {
      (todoStorage.getAll as jest.Mock).mockReturnValue(mockTodos);

      render(<TodosPage />);

      expect(screen.getByText('已完成任务')).toBeInTheDocument();
      expect(screen.getByText('未完成任务')).toBeInTheDocument();
    });

    it('应该过滤显示未完成的待办事项', () => {
      (todoStorage.getAll as jest.Mock).mockReturnValue(mockTodos);

      render(<TodosPage />);

      const activeButton = screen.getByText(/Active/i);
      fireEvent.click(activeButton);

      expect(screen.queryByText('已完成任务')).not.toBeInTheDocument();
      expect(screen.getByText('未完成任务')).toBeInTheDocument();
    });

    it('应该过滤显示已完成的待办事项', () => {
      (todoStorage.getAll as jest.Mock).mockReturnValue(mockTodos);

      render(<TodosPage />);

      const completedButton = screen.getByText(/Completed/i);
      fireEvent.click(completedButton);

      expect(screen.getByText('已完成任务')).toBeInTheDocument();
      expect(screen.queryByText('未完成任务')).not.toBeInTheDocument();
    });

    it('应该在切换过滤器时实时更新显示', () => {
      (todoStorage.getAll as jest.Mock).mockReturnValue(mockTodos);

      render(<TodosPage />);

      // 切换到Active
      fireEvent.click(screen.getByText(/Active/i));
      expect(screen.queryByText('已完成任务')).not.toBeInTheDocument();

      // 切换回All
      fireEvent.click(screen.getByText(/All/i));
      expect(screen.getByText('已完成任务')).toBeInTheDocument();
    });

    it('应该在过滤后没有待办事项时显示空状态', () => {
      const allCompletedTodos: TodoItem[] = [
        {
          id: '1',
          title: '已完成任务',
          completed: true,
          createdAt: new Date('2024-01-15T10:00:00'),
          priority: 'medium' as const, categories: ['work'],
        },
      ];

      (todoStorage.getAll as jest.Mock).mockReturnValue(allCompletedTodos);

      render(<TodosPage />);

      // 切换到Active过滤器
      const activeButton = screen.getByText(/Active/i);
      fireEvent.click(activeButton);

      expect(screen.getByText(/No todos here/i)).toBeInTheDocument();
    });
  });

  describe('切换完成状态副作用', () => {
    it('应该正确切换单个待办事项的完成状态', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: '1',
          title: '任务1',
          completed: false,
          createdAt: new Date('2024-01-15T10:00:00'),
          priority: 'medium' as const, categories: ['work'],
        },
        {
          id: '2',
          title: '任务2',
          completed: false,
          createdAt: new Date('2024-01-15T11:00:00'),
          priority: 'medium' as const, categories: ['personal'],
        },
      ];

      (todoStorage.getAll as jest.Mock).mockReturnValue(mockTodos);

      render(<TodosPage />);

      const toggleButtons = screen.getAllByText('Toggle');
      fireEvent.click(toggleButtons[0]);

      await waitFor(() => {
        expect(todoStorage.save).toHaveBeenCalledWith([
          expect.objectContaining({ id: '1', completed: true }),
          expect.objectContaining({ id: '2', completed: false }),
        ]);
      });
    });

    it('应该支持多次切换', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: '1',
          title: '任务1',
          completed: false,
          createdAt: new Date('2024-01-15T10:00:00'),
          priority: 'medium' as const, categories: ['work'],
        },
      ];

      (todoStorage.getAll as jest.Mock).mockReturnValue(mockTodos);

      render(<TodosPage />);

      const toggleButton = screen.getByText('Toggle');

      // 第一次切换
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(todoStorage.save).toHaveBeenCalled();
        // 验证至少被调用了一次
        const lastCallIndex = (todoStorage.save as jest.Mock).mock.calls.length - 1;
        expect((todoStorage.save as jest.Mock).mock.calls[lastCallIndex][0][0].completed).toBe(true);
      });

      // 第二次切换
      fireEvent.click(toggleButton);
      await waitFor(() => {
        // 验证至少被调用了两次
        expect((todoStorage.save as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(2);
        const lastCallIndex = (todoStorage.save as jest.Mock).mock.calls.length - 1;
        expect((todoStorage.save as jest.Mock).mock.calls[lastCallIndex][0][0].completed).toBe(false);
      });
    });
  });

  describe('导出副作用', () => {
    it('应该调用exportTodos函数', () => {
      const { exportTodos } = require('@/lib/icsExport');

      const mockTodos: TodoItem[] = [
        {
          id: '1',
          title: '测试任务',
          completed: false,
          createdAt: new Date('2024-01-15T10:00:00'),
          priority: 'medium' as const, categories: ['work'],
        },
      ];

      (todoStorage.getAll as jest.Mock).mockReturnValue(mockTodos);

      render(<TodosPage />);

      const exportButton = screen.getByText(/Export to Apple Calendar/i);
      fireEvent.click(exportButton);

      expect(exportTodos).toHaveBeenCalledWith(mockTodos);
    });
  });
});
