/**
 * Todo/Task Hooks
 * 
 * React Query hooks for todo operations.
 * Supports both database and localStorage modes via Feature Flags.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDatabaseStorage } from './useFeatureFlags';
import { todoStorage } from '@/lib/storage';
import type { TodoItem } from '@/types';

// ============================================================
// QUERY KEYS
// ============================================================

export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
};

// ============================================================
// HOOKS
// ============================================================

interface UseTodosParams {
  completed?: boolean;
  priority?: string;
  category?: string;
}

/**
 * Fetch todos - works with both localStorage and database
 */
export function useTodos(params: UseTodosParams = {}) {
  const useDB = useDatabaseStorage();

  return useQuery({
    queryKey: todoKeys.list(params),
    queryFn: async () => {
      if (useDB) {
        // TODO: Implement database fetch when todos are migrated to tasks
        // For now, fall back to localStorage
        return todoStorage.getAll();
      } else {
        let todos = todoStorage.getAll();
        
        // Apply filters
        if (params.completed !== undefined) {
          todos = todos.filter((t) => t.completed === params.completed);
        }
        if (params.priority) {
          todos = todos.filter((t) => t.priority === params.priority);
        }
        if (params.category) {
          todos = todos.filter((t) => t.categories.includes(params.category!));
        }
        
        return todos;
      }
    },
  });
}

/**
 * Create todo mutation
 */
export function useCreateTodo() {
  const queryClient = useQueryClient();
  const useDB = useDatabaseStorage();

  return useMutation({
    mutationFn: async (todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
      if (useDB) {
        // TODO: Implement database create
        const todos = todoStorage.getAll();
        const newTodo: TodoItem = {
          ...todo,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        todoStorage.save([...todos, newTodo]);
        return newTodo;
      } else {
        const todos = todoStorage.getAll();
        const newTodo: TodoItem = {
          ...todo,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        todoStorage.save([...todos, newTodo]);
        return newTodo;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

/**
 * Update todo mutation
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient();
  const useDB = useDatabaseStorage();

  return useMutation({
    mutationFn: async (todo: TodoItem) => {
      if (useDB) {
        // TODO: Implement database update
        const todos = todoStorage.getAll();
        const updated = todos.map((t) => (t.id === todo.id ? todo : t));
        todoStorage.save(updated);
        return todo;
      } else {
        const todos = todoStorage.getAll();
        const updated = todos.map((t) => (t.id === todo.id ? todo : t));
        todoStorage.save(updated);
        return todo;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      queryClient.invalidateQueries({ queryKey: todoKeys.detail(variables.id) });
    },
  });
}

/**
 * Toggle todo completion
 */
export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: string) => {
      const todos = todoStorage.getAll();
      const updated = todos.map((t) =>
        t.id === todoId ? { ...t, completed: !t.completed } : t
      );
      todoStorage.save(updated);
      return updated.find((t) => t.id === todoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

/**
 * Delete todo mutation
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient();
  const useDB = useDatabaseStorage();

  return useMutation({
    mutationFn: async (todoId: string) => {
      if (useDB) {
        // TODO: Implement database delete
        const todos = todoStorage.getAll();
        const filtered = todos.filter((t) => t.id !== todoId);
        todoStorage.save(filtered);
      } else {
        const todos = todoStorage.getAll();
        const filtered = todos.filter((t) => t.id !== todoId);
        todoStorage.save(filtered);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

