'use client';

import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, Badge } from '@/components/ui';
import type { Task } from '@/hooks/useBoards';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const priorityConfig = {
  LOW: { color: 'green', label: '🟢 Low' },
  MEDIUM: { color: 'yellow', label: '🟡 Medium' },
  HIGH: { color: 'pink', label: '🟠 High' },
  URGENT: { color: 'pink', label: '🔴 Urgent' },
} as const;

export default function TaskCard({ task, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority];

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card-3d p-4 rounded-lg border-2 border-[var(--neon-green)]/50 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 scale-105' : ''
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
      }}
    >
      {/* Title */}
      <h4 className="font-semibold text-[var(--color-text)] mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-[var(--color-text-dim)] mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <Badge color={priority.color as any} size="sm">
          {priority.label}
        </Badge>

        {task.assignee && (
          <Avatar
            src={task.assignee.avatarUrl}
            name={task.assignee.name || 'User'}
            size="sm"
          />
        )}
      </div>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.labels.map((l) => (
            <span
              key={l.label.id}
              className="px-2 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: `${l.label.color}30`,
                color: l.label.color,
                border: `1px solid ${l.label.color}`,
              }}
            >
              {l.label.name}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

