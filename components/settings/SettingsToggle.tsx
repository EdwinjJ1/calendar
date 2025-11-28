'use client';

import { motion } from 'framer-motion';

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: 'green' | 'cyan' | 'pink' | 'yellow';
}

const colorMap = {
  green: 'var(--neon-green)',
  cyan: 'var(--neon-cyan)',
  pink: 'var(--neon-pink)',
  yellow: 'var(--neon-yellow)',
};

export default function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  color = 'green',
}: SettingsToggleProps) {
  const colorValue = colorMap[color];

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="font-medium text-[var(--color-text)]">{label}</p>
        {description && (
          <p className="text-sm text-[var(--color-text-dim)]">{description}</p>
        )}
      </div>

      <motion.button
        className="relative w-14 h-8 rounded-full border-2 transition-colors"
        style={{
          borderColor: checked ? colorValue : '#666',
          backgroundColor: checked ? `${colorValue}30` : 'transparent',
        }}
        onClick={() => onChange(!checked)}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute w-6 h-6 rounded-full top-0.5"
          style={{
            backgroundColor: checked ? colorValue : '#666',
            boxShadow: checked ? `0 0 10px ${colorValue}` : 'none',
          }}
          animate={{ left: checked ? 'calc(100% - 26px)' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );
}

