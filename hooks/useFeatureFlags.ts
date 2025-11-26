/**
 * Feature Flag Hooks
 * 
 * React hooks for accessing feature flags in components.
 */

'use client';

import { useMemo } from 'react';
import { 
  FEATURES, 
  isFeatureEnabled, 
  getStorageMode,
  type FeatureFlagKey,
  type StorageMode 
} from '@/lib/featureFlags';

/**
 * Check if a specific feature is enabled
 */
export function useFeatureFlag(feature: FeatureFlagKey): boolean {
  return useMemo(() => isFeatureEnabled(feature), [feature]);
}

/**
 * Check if database storage is enabled
 */
export function useDatabaseStorage(): boolean {
  return useFeatureFlag('USE_DATABASE_STORAGE');
}

/**
 * Get the current storage mode
 */
export function useStorageMode(): StorageMode {
  return useMemo(() => getStorageMode(), []);
}

/**
 * Check if teams feature is enabled
 */
export function useTeamsEnabled(): boolean {
  return useFeatureFlag('ENABLE_TEAMS');
}

/**
 * Check if boards feature is enabled
 */
export function useBoardsEnabled(): boolean {
  return useFeatureFlag('ENABLE_BOARDS');
}

/**
 * Check if chat feature is enabled
 */
export function useChatEnabled(): boolean {
  return useFeatureFlag('ENABLE_CHAT');
}

/**
 * Get all feature flag values
 */
export function useAllFeatureFlags(): typeof FEATURES {
  return FEATURES;
}

