'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: string;
  children: ReactNode;
  color?: 'green' | 'cyan' | 'pink' | 'yellow';
}

const colorMap = {
  green: 'var(--neon-green)',
  cyan: 'var(--neon-cyan)',
  pink: 'var(--neon-pink)',
  yellow: 'var(--neon-yellow)',
};

export default function SettingsSection({
  title,
  description,
  icon,
  children,
  color = 'green',
}: SettingsSectionProps) {
  const colorValue = colorMap[color];

  return (
    <motion.section
      className="card-3d p-6 rounded-xl border-2"
      style={{
        borderColor: `${colorValue}50`,
        boxShadow: `0 0 20px ${colorValue}20`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ boxShadow: `0 0 30px ${colorValue}30` }}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <h2 className="text-xl font-bold" style={{ color: colorValue }}>
            {title}
          </h2>
          {description && (
            <p className="text-sm text-[var(--color-text-dim)]">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.section>
  );
}

