'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { TodoItem as TodoItemType } from '@/types';
import Card from '@/components/ui/Card';

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3">
      <Card 
        variant="dark" 
        padding="sm" 
        className={`group flex items-center gap-4 transition-all duration-200 border border-white/5 ${
          todo.completed ? 'opacity-60 bg-black' : 'hover:border-white/20'
        }`}
      >
        <button
          onClick={() => onToggle(todo.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            todo.completed
              ? 'bg-[var(--color-avocado)] border-[var(--color-avocado)]'
              : 'border-gray-600 hover:border-[var(--color-avocado)]'
          }`}
        >
          {todo.completed && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          )}
        </button>

        <span
          className={`flex-1 text-base font-medium transition-all ${
            todo.completed ? 'text-gray-500 line-through' : 'text-white'
          }`}
        >
          {todo.title}
        </span>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span 
            className={`w-2 h-2 rounded-full ${
              todo.priority === 'high' ? 'bg-red-500' :
              todo.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} 
          />
          <button
            onClick={() => onDelete(todo.id)}
            className="text-gray-500 hover:text-red-400 p-1"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </Card>
    </div>
  );
}