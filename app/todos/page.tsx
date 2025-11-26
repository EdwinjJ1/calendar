'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import TodoList from '@/components/todos/TodoList';
import TodoForm from '@/components/todos/TodoForm';
import Button from '@/components/ui/Button';
import { todoStorage } from '@/lib/storage';
import { exportTodos } from '@/lib/icsExport';
import type { TodoItem } from '@/types';
import { TODO_FILTERS } from '@/lib/constants';

export default function TodosPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filter, setFilter] = useState(TODO_FILTERS.ALL);

  useEffect(() => {
    setTodos(todoStorage.getAll());
  }, []);

  useEffect(() => {
    if (todos.length > 0) {
      todoStorage.save(todos);
    }
  }, [todos]);

  const handleAddTodo = (todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
    setTodos([...todos, { ...todo, id: nanoid(), createdAt: new Date() }]);
  };

  const handleToggle = (id: string) => {
    setTodos(todos.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDelete = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const filteredTodos = todos.filter(t => {
    if (filter === TODO_FILTERS.ACTIVE) return !t.completed;
    if (filter === TODO_FILTERS.COMPLETED) return t.completed;
    return true;
  });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-5xl font-bold neon-text">✅ Todos</h1>
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
              onReorder={setTodos}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
