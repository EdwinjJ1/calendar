'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import BoardColumn from './BoardColumn';
import TaskCard from './TaskCard';
import type { Board, Task, Column } from '@/hooks/useBoards';

interface KanbanBoardProps {
  board: Board;
  onTaskMove?: (taskId: string, sourceColumnId: string, targetColumnId: string, newOrder: number) => void;
}

export default function KanbanBoard({ board, onTaskMove }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(board.columns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  }, [columns]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and target columns
    const sourceColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === activeId)
    );
    const targetColumn = columns.find((col) =>
      col.id === overId || col.tasks.some((t) => t.id === overId)
    );

    if (!sourceColumn || !targetColumn) return;

    const sourceIndex = sourceColumn.tasks.findIndex((t) => t.id === activeId);
    let targetIndex = targetColumn.tasks.findIndex((t) => t.id === overId);
    
    // If dropping on column, add to end
    if (targetColumn.id === overId) {
      targetIndex = targetColumn.tasks.length;
    }

    // Update columns
    setColumns((prev) => {
      const newColumns = prev.map((col) => ({ ...col, tasks: [...col.tasks] }));
      
      const source = newColumns.find((c) => c.id === sourceColumn!.id)!;
      const target = newColumns.find((c) => c.id === targetColumn!.id)!;
      
      const [movedTask] = source.tasks.splice(sourceIndex, 1);
      movedTask.columnId = target.id;
      
      if (source.id === target.id) {
        source.tasks.splice(targetIndex > sourceIndex ? targetIndex - 1 : targetIndex, 0, movedTask);
      } else {
        target.tasks.splice(targetIndex, 0, movedTask);
      }
      
      return newColumns;
    });

    // Notify parent
    if (onTaskMove && sourceColumn.id !== targetColumn.id) {
      onTaskMove(activeId, sourceColumn.id, targetColumn.id, targetIndex);
    }
  }, [columns, onTaskMove]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px]">
        {columns
          .sort((a, b) => a.order - b.order)
          .map((column, index) => (
            <BoardColumn key={column.id} column={column} index={index} />
          ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <motion.div
            initial={{ scale: 1.05, rotate: 3 }}
            animate={{ scale: 1.05, rotate: 3 }}
            className="opacity-90"
          >
            <TaskCard task={activeTask} isDragging />
          </motion.div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

