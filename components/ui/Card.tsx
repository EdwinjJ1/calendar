'use client';

import { HTMLMotionProps, motion } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean; 
  variant?: 'default' | 'flat' | 'outlined' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ 
  hover = false, 
  variant = 'default', 
  padding = 'md',
  className = '', 
  children, 
  ...props 
}: CardProps) {
  const baseStyles = 'rounded-[var(--radius-lg)] overflow-hidden transition-all duration-300';
  
  const variants = {
    default: 'bg-[var(--color-bg-card)] shadow-[var(--shadow-card)]',
    flat: 'shadow-none bg-white',
    outlined: 'border border-gray-200 shadow-none bg-white',
    dark: 'bg-[var(--color-bg-card-dark)] text-white shadow-lg',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'cursor-pointer hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1' : '';

  return (
    <motion.div
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
