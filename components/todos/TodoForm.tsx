'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { formatISO } from 'date-fns';
import Button from '../ui/Button';
import type { TodoItem } from '@/types';
import { PRIORITY_LEVELS, LIMITS } from '@/lib/constants';

interface TodoFormProps {
  onAdd: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: PRIORITY_LEVELS.MEDIUM,
    dueDate: '',
    categories: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAdd({
      title: formData.title,
      description: formData.description,
      completed: false,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      categories: formData.categories.split(',').map(c => c.trim()).filter(Boolean),
    });
    setFormData({ title: '', description: '', priority: PRIORITY_LEVELS.MEDIUM, dueDate: '', categories: '' });
  };

  const inputClass = "w-full px-4 py-3 bg-[var(--color-bg-dark)] border-2 border-[var(--neon-cyan)] rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:border-[var(--neon-green)] focus:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all outline-none";

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 card-3d p-6 rounded-xl border-2 border-[var(--neon-cyan)] shadow-[0_0_30px_rgba(0,255,255,0.3)]"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <input
        type="text"
        placeholder="What needs to be done? ✨"
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
        maxLength={LIMITS.MAX_TITLE_LENGTH}
        className={inputClass}
        required
      />
      <textarea
        placeholder="Description (optional)"
        value={formData.description}
        onChange={e => setFormData({ ...formData, description: e.target.value })}
        maxLength={LIMITS.MAX_DESCRIPTION_LENGTH}
        className={inputClass}
        rows={2}
      />
      <div className="grid grid-cols-3 gap-4">
        <select
          value={formData.priority}
          onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
          className={inputClass}
        >
          <option value={PRIORITY_LEVELS.LOW} className="bg-[var(--color-bg)]">🟢 Low</option>
          <option value={PRIORITY_LEVELS.MEDIUM} className="bg-[var(--color-bg)]">🟡 Medium</option>
          <option value={PRIORITY_LEVELS.HIGH} className="bg-[var(--color-bg)]">🔴 High</option>
        </select>
        <input
          type="date"
          value={formData.dueDate}
          onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
          className={inputClass}
          placeholder="Due date"
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={formData.categories}
          onChange={e => setFormData({ ...formData, categories: e.target.value })}
          className={inputClass}
        />
      </div>
      <Button type="submit" className="w-full" size="lg">✨ Add Todo</Button>
    </motion.form>
  );
}
