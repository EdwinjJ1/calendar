'use client';

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore, useRef } from 'react';
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

// Custom hook to sync with localStorage using useSyncExternalStore
function useLocalStorageTodos(enabled: boolean) {
  const todosRef = useRef<TodoItem[]>([]);

  const subscribe = useCallback((callback: () => void) => {
    const handleStorage = () => callback();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const getSnapshot = useCallback(() => {
    if (!enabled) return todosRef.current;
    const stored = todoStorage.getAll();
    todosRef.current = stored;
    return stored;
  }, [enabled]);

  const getServerSnapshot = useCallback(() => [], []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function TodosPage() {
  // Feature flag check
  const useDB = useDatabaseStorage();
  const storageMode = useStorageMode();

  // Get todos from localStorage using external store pattern
  const storedTodos = useLocalStorageTodos(!useDB);

  // Local state for localStorage mode - tracks modifications
  const [localTodos, setLocalTodos] = useState<TodoItem[]>(storedTodos);
  const [filter, setFilter] = useState<typeof TODO_FILTERS[keyof typeof TODO_FILTERS]>(TODO_FILTERS.ALL);

  // React Query hooks for database mode
  const { data: dbTodos = [], isLoading } = useTodos({});
  const createTodoMutation = useCreateTodo();
  const toggleTodoMutation = useToggleTodo();
  const deleteTodoMutation = useDeleteTodo();

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
    <>
      <div className="min-h-screen p-6 md:p-8 bg-[var(--color-bg)]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Todos</h1>
                {/* Storage mode indicator (dev only) */}
                {process.env.NODE_ENV === 'development' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium uppercase tracking-wider">
                    {storageMode === 'database' ? 'DB' : 'Local'}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">Stay organized and productive</p>
            </div>
            
            <Button onClick={() => exportTodos(todos)} variant="outline" className="gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export
            </Button>
          </motion.div>

          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <TodoForm onAdd={handleAddTodo} />
          </motion.div>

          <motion.div
            className="flex gap-2 mb-6 overflow-x-auto pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {Object.values(TODO_FILTERS).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-[var(--color-avocado)] text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f === 'all' && 'All Tasks'}
                {f === 'active' && 'Active'}
                {f === 'completed' && 'Completed'}
              </button>
            ))}
          </motion.div>

          {isLoading && useDB ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--color-avocado)]"></div>
            </div>
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {filteredTodos.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white/50 rounded-[24px] border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    ✨
                  </div>
                  <p className="font-medium text-gray-500">No tasks found</p>
                  <p className="text-sm mt-1">Add a new task to get started</p>
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
    </>
  );
}
