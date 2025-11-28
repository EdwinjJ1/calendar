'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarGroup, Badge } from '@/components/ui';
import type { Team } from '@/hooks/useTeams';

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
  index?: number;
}

export default function TeamCard({ team, onClick, index = 0 }: TeamCardProps) {
  const memberCount = team._count?.members || team.members?.length || 0;
  const boardCount = team._count?.boards || 0;

  return (
    <motion.div
      className="card-3d p-6 rounded-xl border-2 border-[var(--neon-cyan)] cursor-pointer group"
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
      whileHover={{ 
        scale: 1.03, 
        rotateY: 5,
        boxShadow: '0 0 40px rgba(0, 255, 255, 0.4)',
      }}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <Avatar 
          src={team.avatarUrl} 
          name={team.name} 
          size="lg" 
          color="cyan"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-[var(--color-text)] truncate group-hover:text-[var(--neon-cyan)] transition-colors">
            {team.name}
          </h3>
          
          {team.description && (
            <p className="text-sm text-[var(--color-text-dim)] mt-1 line-clamp-2">
              {team.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-4">
            <Badge color="cyan" size="sm">
              👥 {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </Badge>
            
            <Badge color="yellow" size="sm">
              📋 {boardCount} {boardCount === 1 ? 'board' : 'boards'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Member Avatars Preview */}
      {team.members && team.members.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--neon-cyan)]/30">
          <AvatarGroup
            avatars={team.members.map((m) => ({
              src: m.user.avatarUrl,
              name: m.user.name || m.user.email,
            }))}
            max={5}
            size="sm"
          />
        </div>
      )}

      {/* Hover Effect Glow Line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--neon-cyan)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </motion.div>
  );
}

