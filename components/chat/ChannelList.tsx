'use client';

import { motion } from 'framer-motion';
import type { Channel } from '@/hooks/useChat';

interface ChannelListProps {
  channels: Channel[];
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
}

export default function ChannelList({ 
  channels, 
  selectedChannelId, 
  onSelectChannel 
}: ChannelListProps) {
  return (
    <div className="h-full bg-[var(--color-bg-dark)] border-r-2 border-[var(--neon-cyan)]/30">
      {/* Header */}
      <div className="p-4 border-b border-[var(--neon-cyan)]/30">
        <h2 className="text-lg font-bold text-[var(--neon-cyan)]">💬 Channels</h2>
      </div>

      {/* Channel List */}
      <div className="p-2 space-y-1">
        {channels.map((channel, index) => {
          const isSelected = channel.id === selectedChannelId;

          return (
            <motion.button
              key={channel.id}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                isSelected
                  ? 'bg-[var(--neon-cyan)]/20 border-2 border-[var(--neon-cyan)]'
                  : 'border-2 border-transparent hover:bg-white/5'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 5 }}
              onClick={() => onSelectChannel(channel.id)}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {channel.isPrivate ? '🔒' : '#'}
                </span>
                <span
                  className={`font-medium ${
                    isSelected ? 'text-[var(--neon-cyan)]' : 'text-[var(--color-text)]'
                  }`}
                >
                  {channel.name}
                </span>
              </div>
              
              {channel.description && (
                <p className="text-xs text-[var(--color-text-dim)] mt-1 ml-7 truncate">
                  {channel.description}
                </p>
              )}

              {channel._count && (
                <div className="flex gap-3 mt-2 ml-7 text-xs text-[var(--color-text-dim)]">
                  <span>{channel._count.messages} messages</span>
                  <span>{channel._count.members} members</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Add Channel Button */}
      <div className="p-4">
        <motion.button
          className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-[var(--neon-cyan)]/50 text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          + Add Channel
        </motion.button>
      </div>
    </div>
  );
}

