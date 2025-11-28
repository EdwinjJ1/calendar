'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Button, EmptyState } from '@/components/ui';
import { KanbanBoard } from '@/components/boards';
import { useBoards, useMoveTask } from '@/hooks/useBoards';

export default function BoardsPage() {
  const { data: boards = [], isLoading, error } = useBoards();
  const moveTask = useMoveTask();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // Select first board by default
  const selectedBoard = selectedBoardId 
    ? boards.find((b) => b.id === selectedBoardId) 
    : boards[0];

  const handleTaskMove = (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    newOrder: number
  ) => {
    moveTask.mutate({ taskId, sourceColumnId, targetColumnId, newOrder });
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen p-8 md:pl-28">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <motion.div
            className="flex justify-between items-center mb-8 flex-wrap gap-4"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div>
              <h1 className="text-5xl font-bold neon-text">📋 Boards</h1>
              <p className="text-[var(--color-text-dim)] mt-2">
                Manage your tasks with drag & drop
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Board Selector */}
              {boards.length > 0 && (
                <select
                  className="px-4 py-2 bg-[var(--color-bg-dark)] border-2 border-[var(--neon-yellow)] rounded-xl text-[var(--color-text)] focus:outline-none focus:shadow-[0_0_20px_rgba(255,255,0,0.3)]"
                  value={selectedBoardId || boards[0]?.id}
                  onChange={(e) => setSelectedBoardId(e.target.value)}
                >
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
              )}

              <Button>
                ✨ New Board
              </Button>
            </div>
          </motion.div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div
                className="w-16 h-16 border-4 border-[var(--neon-yellow)] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          ) : error ? (
            <EmptyState
              icon="⚠️"
              title="Error Loading Boards"
              description="Something went wrong. Please try again."
            />
          ) : !selectedBoard ? (
            <EmptyState
              icon="📋"
              title="No Boards Yet"
              description="Create your first board to start organizing tasks."
              action={{
                label: 'Create Board',
                onClick: () => console.log('Create board'),
                icon: '✨',
              }}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Board Info */}
              <motion.div
                className="mb-6 p-4 rounded-xl border-2 border-[var(--neon-yellow)]/30 bg-[var(--color-bg-dark)]/50"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <h2 className="text-2xl font-bold text-[var(--neon-yellow)]">
                  {selectedBoard.name}
                </h2>
                {selectedBoard.description && (
                  <p className="text-[var(--color-text-dim)] mt-1">
                    {selectedBoard.description}
                  </p>
                )}
                {selectedBoard.team && (
                  <p className="text-sm text-[var(--neon-cyan)] mt-2">
                    👥 {selectedBoard.team.name}
                  </p>
                )}
              </motion.div>

              {/* Kanban Board */}
              <KanbanBoard
                board={selectedBoard}
                onTaskMove={handleTaskMove}
              />
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

