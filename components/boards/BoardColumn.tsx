'use client';

import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import type { Column } from '@/hooks/useBoards';

interface BoardColumnProps {
  column: Column;
  index: number;
}

export default function BoardColumn({ column, index }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <motion.div
      className="flex-shrink-0 w-80"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
    >
      {/* Column Header */}
      <motion.div
        className="flex items-center justify-between p-4 rounded-t-xl border-2 border-b-0"
        style={{
          borderColor: column.color,
          backgroundColor: `${column.color}15`,
        }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: column.color,
              boxShadow: `0 0 10px ${column.color}`,
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h3 className="font-bold text-lg" style={{ color: column.color }}>
            {column.name}
          </h3>
          <span className="text-sm text-[var(--color-text-dim)] bg-white/10 px-2 py-0.5 rounded-full">
            {column.tasks.length}
          </span>
        </div>

        <motion.button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg border"
          style={{ borderColor: column.color, color: column.color }}
          whileHover={{ scale: 1.1, backgroundColor: `${column.color}30` }}
          whileTap={{ scale: 0.9 }}
        >
          +
        </motion.button>
      </motion.div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={`min-h-[200px] p-3 rounded-b-xl border-2 border-t-0 space-y-3 transition-all ${
          isOver ? 'bg-white/5' : 'bg-[var(--color-bg-dark)]/50'
        }`}
        style={{
          borderColor: column.color,
          boxShadow: isOver ? `0 0 30px ${column.color}40` : 'none',
        }}
      >
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <motion.div
            className="flex items-center justify-center h-24 text-[var(--color-text-dim)] text-sm border-2 border-dashed rounded-lg"
            style={{ borderColor: `${column.color}40` }}
            animate={{ opacity: isOver ? 1 : 0.5 }}
          >
            {isOver ? '📥 Drop here' : 'No tasks yet'}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

