'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  color?: 'green' | 'cyan' | 'pink' | 'yellow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const colorMap = {
  green: {
    border: 'var(--neon-green)',
    shadow: 'rgba(0, 255, 65, 0.5)',
  },
  cyan: {
    border: 'var(--neon-cyan)',
    shadow: 'rgba(0, 255, 255, 0.5)',
  },
  pink: {
    border: 'var(--neon-pink)',
    shadow: 'rgba(255, 0, 110, 0.5)',
  },
  yellow: {
    border: 'var(--neon-yellow)',
    shadow: 'rgba(255, 255, 0, 0.5)',
  },
};

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  color = 'green',
  size = 'md' 
}: ModalProps) {
  const colorConfig = colorMap[color];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`card-3d p-8 w-full ${sizeMap[size]} rounded-2xl`}
            style={{
              border: `2px solid ${colorConfig.border}`,
              boxShadow: `0 0 50px ${colorConfig.shadow}`,
            }}
            initial={{ scale: 0.8, rotateY: -45, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ scale: 0.8, rotateY: 45, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 
                className="text-3xl font-bold"
                style={{ color: colorConfig.border }}
              >
                {title}
              </h2>
              <motion.button
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl"
                style={{ borderColor: colorConfig.border, color: colorConfig.border }}
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

