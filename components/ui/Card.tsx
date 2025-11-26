'use client';

import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  float?: boolean;
  glow?: boolean;
}

export default function Card({ hover = true, float = false, glow = true, className = '', children, ...props }: CardProps) {
  const baseStyles = 'card-3d p-6 rounded-xl border-2 border-[var(--neon-green)]';
  const hoverStyles = hover ? 'cursor-pointer' : '';
  const floatStyles = float ? 'floating' : '';
  const glowStyles = glow ? 'shadow-[0_0_30px_rgba(0,255,65,0.3)]' : '';

  return (
    <motion.div
      className={`${baseStyles} ${hoverStyles} ${floatStyles} ${glowStyles} ${className}`}
      whileHover={hover ? { scale: 1.05, rotateY: 5, rotateX: 5 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
