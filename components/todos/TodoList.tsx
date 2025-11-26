'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TodoItem from './TodoItem';
import type { TodoItem as TodoItemType } from '@/types';

interface TodoListProps {
  todos: TodoItemType[];
  onReorder: (todos: TodoItemType[]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoList({ todos, onReorder, onToggle, onDelete }: TodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex(t => t.id === active.id);
      const newIndex = todos.findIndex(t => t.id === over.id);
      onReorder(arrayMove(todos, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {todos.map(todo => (
            <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
