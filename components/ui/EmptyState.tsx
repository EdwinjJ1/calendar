'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="text-6xl mb-6"
        animate={{ 
          y: [0, -10, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {icon}
      </motion.div>
      
      <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-[var(--color-text-dim)] mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

