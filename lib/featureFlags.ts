/**
 * Feature Flag System
 * 
 * Controls feature rollout and storage mode switching.
 * Enables gradual migration from localStorage to database.
 * 
 * Usage:
 * ```ts
 * import { FEATURES, isFeatureEnabled } from '@/lib/featureFlags';
 * 
 * if (isFeatureEnabled('USE_DATABASE_STORAGE')) {
 *   // Use database
 * } else {
 *   // Use localStorage
 * }
 * ```
 */

// ============================================================
// FEATURE FLAG DEFINITIONS
// ============================================================

/**
 * All feature flags and their default values
 */
export const FEATURE_DEFAULTS = {
  /** Use database instead of localStorage for data storage */
  USE_DATABASE_STORAGE: false,
  
  /** Enable team features (requires database) */
  ENABLE_TEAMS: false,
  
  /** Enable Kanban board feature */
  ENABLE_BOARDS: false,
  
  /** Enable chat feature */
  ENABLE_CHAT: false,
  
  /** Enable AI parsing in chat messages */
  ENABLE_AI_CHAT_PARSING: false,
  
  /** Enable real-time sync via Supabase */
  ENABLE_REALTIME_SYNC: false,
  
  /** Show migration banner to users */
  SHOW_MIGRATION_BANNER: false,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_DEFAULTS;

// ============================================================
// FEATURE FLAG STATE
// ============================================================

/**
 * Current feature flag values (computed from environment + defaults)
 */
export const FEATURES: Record<FeatureFlagKey, boolean> = {
  USE_DATABASE_STORAGE: 
    process.env.NEXT_PUBLIC_USE_DB === 'true',
  
  ENABLE_TEAMS: 
    process.env.NEXT_PUBLIC_ENABLE_TEAMS === 'true',
  
  ENABLE_BOARDS: 
    process.env.NEXT_PUBLIC_ENABLE_BOARDS === 'true',
  
  ENABLE_CHAT: 
    process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true',
  
  ENABLE_AI_CHAT_PARSING: 
    process.env.NEXT_PUBLIC_ENABLE_AI_CHAT === 'true',
  
  ENABLE_REALTIME_SYNC: 
    process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
  
  SHOW_MIGRATION_BANNER: 
    process.env.NEXT_PUBLIC_SHOW_MIGRATION_BANNER === 'true',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: FeatureFlagKey): boolean {
  return FEATURES[feature] ?? FEATURE_DEFAULTS[feature];
}

/**
 * Check if database storage is enabled
 * Shorthand for the most common check
 */
export function useDatabaseStorage(): boolean {
  return isFeatureEnabled('USE_DATABASE_STORAGE');
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureFlagKey[] {
  return (Object.keys(FEATURES) as FeatureFlagKey[]).filter(
    (key) => FEATURES[key]
  );
}

/**
 * Get feature flag status for debugging
 */
export function getFeatureFlagStatus(): Record<FeatureFlagKey, boolean> {
  return { ...FEATURES };
}

// ============================================================
// STORAGE MODE UTILITIES
// ============================================================

export type StorageMode = 'localStorage' | 'database';

/**
 * Get the current storage mode
 */
export function getStorageMode(): StorageMode {
  return useDatabaseStorage() ? 'database' : 'localStorage';
}

/**
 * Check if we're in migration mode (showing both storage options)
 */
export function isMigrationMode(): boolean {
  return isFeatureEnabled('SHOW_MIGRATION_BANNER');
}

