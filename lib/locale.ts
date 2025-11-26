/**
 * Locale management utilities
 * Provides functions to get and set user's preferred language
 */

'use client';

export const LOCALES = {
  EN: 'en',
  ZH: 'zh',
} as const;

export type Locale = typeof LOCALES[keyof typeof LOCALES];

export const LOCALE_NAMES = {
  [LOCALES.EN]: 'English',
  [LOCALES.ZH]: '中文',
} as const;

/**
 * Set user's preferred locale in cookie
 * @param locale - The locale to set (en or zh)
 */
export function setLocale(locale: Locale): void {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`; // 1 year
  window.location.reload(); // Reload to apply new locale
}

/**
 * Get current locale from cookie
 * @returns Current locale or 'en' as default
 */
export function getLocale(): Locale {
  if (typeof document === 'undefined') return LOCALES.EN;

  const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  return (match?.[1] as Locale) || LOCALES.EN;
}
