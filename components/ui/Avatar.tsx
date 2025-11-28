'use client';

import { motion } from 'framer-motion';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'green' | 'cyan' | 'pink' | 'yellow';
  online?: boolean;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-12 h-12', text: 'text-base' },
  xl: { container: 'w-16 h-16', text: 'text-xl' },
};

const colorMap = {
  green: 'var(--neon-green)',
  cyan: 'var(--neon-cyan)',
  pink: 'var(--neon-pink)',
  yellow: 'var(--neon-yellow)',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name?: string): string {
  if (!name) return colorMap.green;
  const colors = Object.values(colorMap);
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function Avatar({ 
  src, 
  name, 
  size = 'md', 
  color,
  online 
}: AvatarProps) {
  const sizeConfig = sizeMap[size];
  const avatarColor = color ? colorMap[color] : getColorFromName(name);

  return (
    <motion.div
      className={`${sizeConfig.container} rounded-full relative flex items-center justify-center overflow-hidden border-2`}
      style={{
        borderColor: avatarColor,
        backgroundColor: src ? 'transparent' : `${avatarColor}30`,
        boxShadow: `0 0 15px ${avatarColor}40`,
      }}
      whileHover={{ scale: 1.1 }}
    >
      {src ? (
        <img 
          src={src} 
          alt={name || 'Avatar'} 
          className="w-full h-full object-cover"
        />
      ) : (
        <span 
          className={`font-bold ${sizeConfig.text}`}
          style={{ color: avatarColor }}
        >
          {getInitials(name)}
        </span>
      )}
      
      {online !== undefined && (
        <motion.div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--color-bg-dark)]`}
          style={{
            backgroundColor: online ? 'var(--neon-green)' : '#666',
            boxShadow: online ? '0 0 10px var(--neon-green)' : 'none',
          }}
          animate={online ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// Avatar Group for showing multiple avatars
interface AvatarGroupProps {
  avatars: { src?: string | null; name?: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ avatars, max = 4, size = 'md' }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((avatar, index) => (
        <div key={index} style={{ zIndex: visible.length - index }}>
          <Avatar {...avatar} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <motion.div
          className={`${sizeMap[size].container} rounded-full bg-[var(--color-bg-dark)] border-2 border-[var(--neon-cyan)] flex items-center justify-center`}
          style={{ zIndex: 0 }}
          whileHover={{ scale: 1.1 }}
        >
          <span className={`${sizeMap[size].text} text-[var(--neon-cyan)] font-bold`}>
            +{remaining}
          </span>
        </motion.div>
      )}
    </div>
  );
}

