'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import TodoList from '@/components/todos/TodoList';
import TodoForm from '@/components/todos/TodoForm';
import Button from '@/components/ui/Button';
import { todoStorage } from '@/lib/storage';
import { exportTodos } from '@/lib/icsExport';
import { useDatabaseStorage, useStorageMode } from '@/hooks/useFeatureFlags';
import { useTodos, useCreateTodo, useToggleTodo, useDeleteTodo } from '@/hooks/useTodos';
import type { TodoItem } from '@/types';
import { TODO_FILTERS } from '@/lib/constants';

export default function TodosPage() {
  // Feature flag check
  const useDB = useDatabaseStorage();
  const storageMode = useStorageMode();

  // Local state for localStorage mode
  const [localTodos, setLocalTodos] = useState<TodoItem[]>([]);
  const [filter, setFilter] = useState<typeof TODO_FILTERS[keyof typeof TODO_FILTERS]>(TODO_FILTERS.ALL);

  // React Query hooks for database mode
  const { data: dbTodos = [], isLoading, refetch } = useTodos({});
  const createTodoMutation = useCreateTodo();
  const toggleTodoMutation = useToggleTodo();
  const deleteTodoMutation = useDeleteTodo();

  // Load todos from localStorage on mount (localStorage mode only)
  useEffect(() => {
    if (!useDB) {
      setLocalTodos(todoStorage.getAll());
    }
  }, [useDB]);

  // Save to localStorage when todos change (localStorage mode only)
  useEffect(() => {
    if (!useDB && localTodos.length > 0) {
      todoStorage.save(localTodos);
    }
  }, [localTodos, useDB]);

  // Determine which todos to display
  const todos = useDB ? dbTodos : localTodos;

  // Handle adding todo
  const handleAddTodo = useCallback(async (todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
    if (useDB) {
      await createTodoMutation.mutateAsync(todo);
    } else {
      setLocalTodos(prev => [...prev, { ...todo, id: nanoid(), createdAt: new Date() }]);
    }
  }, [useDB, createTodoMutation]);

  // Handle toggle
  const handleToggle = useCallback(async (id: string) => {
    if (useDB) {
      await toggleTodoMutation.mutateAsync(id);
    } else {
      setLocalTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
    }
  }, [useDB, toggleTodoMutation]);

  // Handle delete
  const handleDelete = useCallback(async (id: string) => {
    if (useDB) {
      await deleteTodoMutation.mutateAsync(id);
    } else {
      setLocalTodos(prev => prev.filter(t => t.id !== id));
    }
  }, [useDB, deleteTodoMutation]);

  // Handle reorder (localStorage mode only for now)
  const handleReorder = useCallback((newTodos: TodoItem[]) => {
    if (!useDB) {
      setLocalTodos(newTodos);
    }
    // TODO: Implement reorder for database mode
  }, [useDB]);

  // Filter todos
  const filteredTodos = useMemo(() => {
    return todos.filter(t => {
      if (filter === TODO_FILTERS.ACTIVE) return !t.completed;
      if (filter === TODO_FILTERS.COMPLETED) return t.completed;
      return true;
    });
  }, [todos, filter]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-bold neon-text">✅ Todos</h1>
            {/* Storage mode indicator (dev only) */}
            {process.env.NODE_ENV === 'development' && (
              <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                {storageMode === 'database' ? '🗄️ DB' : '💾 Local'}
              </span>
            )}
          </div>
          <Button onClick={() => exportTodos(todos)} variant="secondary">
            📤 Export to Apple Calendar
          </Button>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <TodoForm onAdd={handleAddTodo} />
        </motion.div>

        <motion.div
          className="flex gap-3 my-8 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {Object.values(TODO_FILTERS).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'secondary'}
              onClick={() => setFilter(f)}
              size="md"
            >
              {f === 'all' && '📋 All'}
              {f === 'active' && '⚡ Active'}
              {f === 'completed' && '✓ Completed'}
            </Button>
          ))}
        </motion.div>

        {isLoading && useDB ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {filteredTodos.length === 0 ? (
              <div className="text-center py-16 text-[var(--color-text-dim)] text-xl">
                <p className="mb-4 text-4xl">🎉</p>
                <p>No todos here! Time to relax or add a new one.</p>
              </div>
            ) : (
              <TodoList
                todos={filteredTodos}
                onReorder={handleReorder}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
