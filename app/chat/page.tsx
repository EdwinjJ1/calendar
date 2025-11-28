'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, EmptyState } from '@/components/ui';
import { ChannelList, MessageList, MessageInput } from '@/components/chat';
import { useChannels, useMessages, useSendMessage } from '@/hooks/useChat';

export default function ChatPage() {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  
  const { data: channels = [], isLoading: channelsLoading } = useChannels();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(
    selectedChannelId || ''
  );
  const sendMessage = useSendMessage();

  // Select first channel by default
  const effectiveChannelId = selectedChannelId || channels[0]?.id;
  const selectedChannel = channels.find((c) => c.id === effectiveChannelId);

  const handleSendMessage = (content: string) => {
    if (!effectiveChannelId) return;
    
    sendMessage.mutate({
      channelId: effectiveChannelId,
      content,
    });
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen md:pl-20">
        {channelsLoading ? (
          <div className="flex items-center justify-center h-screen">
            <motion.div
              className="w-16 h-16 border-4 border-[var(--neon-cyan)] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : channels.length === 0 ? (
          <div className="flex items-center justify-center h-screen">
            <EmptyState
              icon="💬"
              title="No Channels Yet"
              description="Create a team first, then add channels for communication."
            />
          </div>
        ) : (
          <div className="flex h-screen">
            {/* Sidebar - Channel List */}
            <motion.div
              className="w-64 flex-shrink-0 hidden md:block"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <ChannelList
                channels={channels}
                selectedChannelId={effectiveChannelId || null}
                onSelectChannel={(id) => setSelectedChannelId(id)}
              />
            </motion.div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[var(--color-bg)]">
              {/* Channel Header */}
              {selectedChannel && (
                <motion.div
                  className="p-4 border-b-2 border-[var(--neon-cyan)]/30 bg-[var(--color-bg-dark)]"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {selectedChannel.isPrivate ? '🔒' : '#'}
                    </span>
                    <div>
                      <h1 className="text-xl font-bold text-[var(--neon-cyan)]">
                        {selectedChannel.name}
                      </h1>
                      {selectedChannel.description && (
                        <p className="text-sm text-[var(--color-text-dim)]">
                          {selectedChannel.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Messages */}
              <MessageList
                messages={selectedChannelId ? messages : channels[0] ? messages : []}
                isLoading={messagesLoading}
              />

              {/* Message Input */}
              <MessageInput
                onSend={handleSendMessage}
                disabled={!effectiveChannelId || sendMessage.isPending}
                placeholder={
                  selectedChannel
                    ? `Message #${selectedChannel.name}`
                    : 'Select a channel to start chatting'
                }
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

