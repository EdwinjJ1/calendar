'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { TodoItem as TodoItemType } from '@/types';
import { PRIORITY_COLORS, DATE_FORMATS } from '@/lib/constants';

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: todo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card-3d p-5 rounded-xl border-2 border-[var(--neon-green)] shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:shadow-[0_0_40px_rgba(0,255,65,0.6)] transition-all cursor-move"
      whileHover={{ scale: 1.02, rotateZ: 1 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-4">
        <motion.input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="mt-1 w-5 h-5 accent-[var(--neon-green)] cursor-pointer"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        />
        <div className="flex-1">
          <h3 className={`font-bold text-xl ${todo.completed ? 'line-through opacity-50 text-[var(--color-text-dim)]' : 'text-[var(--neon-green)]'}`}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className="text-sm text-[var(--color-text-dim)] mt-2">{todo.description}</p>
          )}
          <div className="flex gap-2 mt-3 flex-wrap">
            <motion.span
              className="text-xs px-3 py-1.5 rounded-full font-bold border-2"
              style={{
                backgroundColor: PRIORITY_COLORS[todo.priority],
                borderColor: PRIORITY_COLORS[todo.priority],
                color: 'var(--color-bg)',
                boxShadow: `0 0 15px ${PRIORITY_COLORS[todo.priority]}`,
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {todo.priority.toUpperCase()}
            </motion.span>
            {todo.dueDate && (
              <motion.span
                className="text-xs px-3 py-1.5 rounded-full bg-transparent border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] font-bold"
                style={{ boxShadow: '0 0 10px rgba(0,255,255,0.5)' }}
                whileHover={{ scale: 1.1 }}
              >
                📅 {format(todo.dueDate, DATE_FORMATS.DISPLAY)}
              </motion.span>
            )}
            {todo.categories.map(cat => (
              <motion.span
                key={cat}
                className="text-xs px-3 py-1.5 rounded-full bg-[var(--neon-pink)] border-2 border-[var(--neon-pink)] text-white font-bold"
                style={{ boxShadow: '0 0 10px var(--neon-pink)' }}
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                #{cat}
              </motion.span>
            ))}
          </div>
        </div>
        <motion.button
          onClick={() => onDelete(todo.id)}
          className="text-3xl text-[var(--neon-pink)] hover:text-white font-bold"
          whileHover={{ scale: 1.3, rotate: 90 }}
          whileTap={{ scale: 0.8 }}
        >
          ×
        </motion.button>
      </div>
    </motion.div>
  );
}
