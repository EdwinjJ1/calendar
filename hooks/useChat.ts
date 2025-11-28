/**
 * Chat Hooks
 * 
 * React Query hooks for chat operations.
 * Uses demo data for local development.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

// ============================================================
// TYPES
// ============================================================

export interface Message {
  id: string;
  content: string;
  senderId: string;
  channelId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  teamId: string;
  isPrivate: boolean;
  createdAt: string;
  _count?: {
    messages: number;
    members: number;
  };
}

// ============================================================
// DEMO DATA
// ============================================================

const demoChannels: Channel[] = [
  { id: 'ch-1', name: 'general', description: 'General discussion', teamId: 'team-1', isPrivate: false, createdAt: new Date().toISOString(), _count: { messages: 42, members: 5 } },
  { id: 'ch-2', name: 'random', description: 'Random stuff', teamId: 'team-1', isPrivate: false, createdAt: new Date().toISOString(), _count: { messages: 18, members: 5 } },
  { id: 'ch-3', name: 'development', description: 'Dev discussions', teamId: 'team-1', isPrivate: false, createdAt: new Date().toISOString(), _count: { messages: 156, members: 3 } },
  { id: 'ch-4', name: 'design', description: 'Design feedback', teamId: 'team-1', isPrivate: false, createdAt: new Date().toISOString(), _count: { messages: 23, members: 2 } },
];

const demoMessages: Record<string, Message[]> = {
  'ch-1': [
    { id: 'm1', content: 'Hey everyone! 👋', senderId: 'user-1', channelId: 'ch-1', createdAt: new Date(Date.now() - 3600000).toISOString(), sender: { id: 'user-1', name: 'Alice', avatarUrl: null } },
    { id: 'm2', content: 'Welcome to the team!', senderId: 'user-2', channelId: 'ch-1', createdAt: new Date(Date.now() - 3000000).toISOString(), sender: { id: 'user-2', name: 'Bob', avatarUrl: null } },
    { id: 'm3', content: 'Excited to be here! This project looks amazing 🚀', senderId: 'user-1', channelId: 'ch-1', createdAt: new Date(Date.now() - 2400000).toISOString(), sender: { id: 'user-1', name: 'Alice', avatarUrl: null } },
    { id: 'm4', content: 'Let me know if you need any help getting started.', senderId: 'user-3', channelId: 'ch-1', createdAt: new Date(Date.now() - 1800000).toISOString(), sender: { id: 'user-3', name: 'Carol', avatarUrl: null } },
  ],
  'ch-2': [
    { id: 'm5', content: 'Anyone watching the game tonight? 🏀', senderId: 'user-2', channelId: 'ch-2', createdAt: new Date(Date.now() - 7200000).toISOString(), sender: { id: 'user-2', name: 'Bob', avatarUrl: null } },
  ],
  'ch-3': [
    { id: 'm6', content: 'Just pushed the new feature branch.', senderId: 'user-3', channelId: 'ch-3', createdAt: new Date(Date.now() - 1200000).toISOString(), sender: { id: 'user-3', name: 'Carol', avatarUrl: null } },
    { id: 'm7', content: 'Nice! I\'ll review it shortly.', senderId: 'user-1', channelId: 'ch-3', createdAt: new Date(Date.now() - 600000).toISOString(), sender: { id: 'user-1', name: 'Alice', avatarUrl: null } },
  ],
  'ch-4': [],
};

// ============================================================
// QUERY KEYS
// ============================================================

export const chatKeys = {
  channels: ['channels'] as const,
  channel: (id: string) => ['channels', id] as const,
  messages: (channelId: string) => ['messages', channelId] as const,
};

// ============================================================
// HOOKS
// ============================================================

export function useChannels(teamId?: string) {
  return useQuery({
    queryKey: chatKeys.channels,
    queryFn: async () => demoChannels,
  });
}

export function useMessages(channelId: string) {
  return useQuery({
    queryKey: chatKeys.messages(channelId),
    queryFn: async () => demoMessages[channelId] || [],
    enabled: !!channelId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelId, content }: { channelId: string; content: string }) => {
      const newMessage: Message = {
        id: `m-${Date.now()}`,
        content,
        senderId: 'current-user',
        channelId,
        createdAt: new Date().toISOString(),
        sender: { id: 'current-user', name: 'You', avatarUrl: null },
      };
      
      // Add to demo data
      if (!demoMessages[channelId]) {
        demoMessages[channelId] = [];
      }
      demoMessages[channelId].push(newMessage);
      
      return newMessage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.channelId) });
    },
  });
}

