'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Avatar } from '@/components/ui';
import type { Message } from '@/hooks/useChat';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-4 border-[var(--neon-cyan)] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-dim)]">
        <motion.div
          className="text-6xl mb-4"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          💬
        </motion.div>
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === 'current-user';
        const showAvatar = index === 0 || 
          messages[index - 1].senderId !== message.senderId;

        return (
          <motion.div
            key={message.id}
            className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 w-10">
              {showAvatar && (
                <Avatar
                  src={message.sender.avatarUrl}
                  name={message.sender.name || 'User'}
                  size="md"
                  color={isCurrentUser ? 'green' : 'cyan'}
                />
              )}
            </div>

            {/* Message Content */}
            <div
              className={`max-w-[70%] ${isCurrentUser ? 'text-right' : ''}`}
            >
              {showAvatar && (
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${
                    isCurrentUser ? 'text-[var(--neon-green)]' : 'text-[var(--neon-cyan)]'
                  }`}>
                    {message.sender.name || 'User'}
                  </span>
                  <span className="text-xs text-[var(--color-text-dim)]">
                    {format(new Date(message.createdAt), 'HH:mm')}
                  </span>
                </div>
              )}

              <motion.div
                className={`inline-block px-4 py-2 rounded-2xl ${
                  isCurrentUser
                    ? 'bg-[var(--neon-green)]/20 border border-[var(--neon-green)]/50'
                    : 'bg-[var(--color-bg-dark)] border border-[var(--neon-cyan)]/30'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-[var(--color-text)]">{message.content}</p>
              </motion.div>
            </div>
          </motion.div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

