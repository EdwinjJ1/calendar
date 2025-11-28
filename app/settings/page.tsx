'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Button, Avatar, Input } from '@/components/ui';
import { SettingsSection, SettingsToggle } from '@/components/settings';
import { useStorageMode } from '@/hooks/useFeatureFlags';

export default function SettingsPage() {
  const storageMode = useStorageMode();
  
  // Demo user data
  const [user, setUser] = useState({
    name: 'Demo User',
    email: 'demo@example.com',
    avatarUrl: null as string | null,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    darkMode: true,
    notifications: true,
    emailDigest: false,
    soundEffects: true,
    animations: true,
    compactMode: false,
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen p-8 md:pl-28">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-5xl font-bold neon-text">⚙️ Settings</h1>
            <p className="text-[var(--color-text-dim)] mt-2">
              Customize your experience
            </p>
          </motion.div>

          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SettingsSection title="Profile" icon="👤" color="cyan">
              <div className="flex items-center gap-6">
                <Avatar
                  src={user.avatarUrl}
                  name={user.name}
                  size="xl"
                  color="cyan"
                />
                <div className="flex-1 space-y-4">
                  <Input
                    label="Display Name"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    color="cyan"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    color="cyan"
                    disabled
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="secondary">📷 Change Avatar</Button>
              </div>
            </SettingsSection>
          </motion.div>

          {/* Appearance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SettingsSection title="Appearance" icon="🎨" color="pink">
              <SettingsToggle
                label="Dark Mode"
                description="Use dark theme (always enabled for neon vibes)"
                checked={preferences.darkMode}
                onChange={() => togglePreference('darkMode')}
                color="pink"
              />
              <SettingsToggle
                label="Animations"
                description="Enable smooth animations and transitions"
                checked={preferences.animations}
                onChange={() => togglePreference('animations')}
                color="pink"
              />
              <SettingsToggle
                label="Compact Mode"
                description="Reduce spacing for more content on screen"
                checked={preferences.compactMode}
                onChange={() => togglePreference('compactMode')}
                color="pink"
              />
            </SettingsSection>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SettingsSection title="Notifications" icon="🔔" color="yellow">
              <SettingsToggle
                label="Push Notifications"
                description="Receive notifications for important updates"
                checked={preferences.notifications}
                onChange={() => togglePreference('notifications')}
                color="yellow"
              />
              <SettingsToggle
                label="Email Digest"
                description="Receive daily summary of activities"
                checked={preferences.emailDigest}
                onChange={() => togglePreference('emailDigest')}
                color="yellow"
              />
              <SettingsToggle
                label="Sound Effects"
                description="Play sounds for notifications"
                checked={preferences.soundEffects}
                onChange={() => togglePreference('soundEffects')}
                color="yellow"
              />
            </SettingsSection>
          </motion.div>

          {/* Storage Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SettingsSection title="Data & Storage" icon="💾" color="green">
              <div className="p-4 rounded-lg bg-[var(--color-bg-dark)] border border-[var(--neon-green)]/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Storage Mode</p>
                    <p className="text-sm text-[var(--color-text-dim)]">
                      Current: {storageMode === 'database' ? '🗄️ Database' : '💾 Local Storage'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-[var(--neon-green)]/20 text-[var(--neon-green)] border border-[var(--neon-green)]/50">
                    {storageMode}
                  </span>
                </div>
              </div>
              <Button variant="danger" className="w-full mt-4">
                🗑️ Clear All Local Data
              </Button>
            </SettingsSection>
          </motion.div>
        </div>
      </div>
    </>
  );
}

