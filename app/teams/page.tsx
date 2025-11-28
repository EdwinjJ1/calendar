'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Button, EmptyState } from '@/components/ui';
import { TeamCard, CreateTeamModal } from '@/components/teams';
import { useTeams } from '@/hooks/useTeams';

export default function TeamsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: teams = [], isLoading, error } = useTeams();

  return (
    <>
      <Navigation />
      <div className="min-h-screen p-8 md:pl-28">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="flex justify-between items-center mb-8 flex-wrap gap-4"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div>
              <h1 className="text-5xl font-bold neon-text">👥 Teams</h1>
              <p className="text-[var(--color-text-dim)] mt-2">
                Collaborate with your team members
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              ✨ New Team
            </Button>
          </motion.div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div
                className="w-16 h-16 border-4 border-[var(--neon-cyan)] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          ) : error ? (
            <EmptyState
              icon="⚠️"
              title="Error Loading Teams"
              description="Something went wrong. Please try again."
            />
          ) : teams.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No Teams Yet"
              description="Create your first team to start collaborating with others."
              action={{
                label: 'Create Team',
                onClick: () => setIsCreateModalOpen(true),
                icon: '✨',
              }}
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {teams.map((team, index) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  index={index}
                  onClick={() => {
                    // TODO: Navigate to team detail page
                    console.log('View team:', team.id);
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}

