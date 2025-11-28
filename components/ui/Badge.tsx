'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: 'green' | 'cyan' | 'pink' | 'yellow' | 'gray';
  size?: 'sm' | 'md';
  glow?: boolean;
  onClick?: () => void;
}

const colorMap = {
  green: {
    bg: 'rgba(0, 255, 65, 0.2)',
    border: 'var(--neon-green)',
    text: 'var(--neon-green)',
  },
  cyan: {
    bg: 'rgba(0, 255, 255, 0.2)',
    border: 'var(--neon-cyan)',
    text: 'var(--neon-cyan)',
  },
  pink: {
    bg: 'rgba(255, 0, 110, 0.2)',
    border: 'var(--neon-pink)',
    text: 'var(--neon-pink)',
  },
  yellow: {
    bg: 'rgba(255, 255, 0, 0.2)',
    border: 'var(--neon-yellow)',
    text: 'var(--neon-yellow)',
  },
  gray: {
    bg: 'rgba(128, 128, 128, 0.2)',
    border: '#666',
    text: '#999',
  },
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export default function Badge({ 
  children, 
  color = 'green', 
  size = 'md', 
  glow = true,
  onClick 
}: BadgeProps) {
  const colorConfig = colorMap[color];

  return (
    <motion.span
      className={`inline-flex items-center rounded-full border font-medium ${sizeMap[size]} ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor: colorConfig.bg,
        borderColor: colorConfig.border,
        color: colorConfig.text,
        boxShadow: glow ? `0 0 10px ${colorConfig.border}40` : 'none',
      }}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
    >
      {children}
    </motion.span>
  );
}

