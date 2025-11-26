'use client';

import { motion } from 'framer-motion';
import { LOCALES, LOCALE_NAMES, setLocale, getLocale, type Locale } from '@/lib/locale';
import { useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>(LOCALES.EN);

  useEffect(() => {
    setCurrentLocale(getLocale());
  }, []);

  const handleSwitch = (locale: Locale) => {
    setLocale(locale);
  };

  return (
    <motion.div
      className="fixed top-8 right-8 z-50 flex gap-2"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      {Object.entries(LOCALE_NAMES).map(([key, name]) => (
        <motion.button
          key={key}
          onClick={() => handleSwitch(key as Locale)}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all
            ${
              currentLocale === key
                ? 'bg-[var(--neon-green)] text-[var(--color-bg)] shadow-[0_0_20px_rgba(0,255,65,0.5)]'
                : 'bg-transparent text-[var(--neon-green)] border-2 border-[var(--neon-green)] hover:bg-[var(--neon-green)] hover:text-[var(--color-bg)]'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {name}
        </motion.button>
      ))}
    </motion.div>
  );
}
