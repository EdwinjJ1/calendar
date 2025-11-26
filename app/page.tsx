'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Home() {
  const t = useTranslations('home');

  useEffect(() => {
    // Particles.js initialization
    if (typeof window !== 'undefined' && (window as any).particlesJS) {
      (window as any).particlesJS('particles-js', {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: '#00ff41' },
          shape: { type: 'circle' },
          opacity: { value: 0.5, random: true },
          size: { value: 3, random: true },
          line_linked: { enable: true, distance: 150, color: '#00ff41', opacity: 0.4, width: 1 },
          move: { enable: true, speed: 2, direction: 'none', random: true, out_mode: 'out' },
        },
      });
    }
  }, []);

  return (
    <>
      <div id="particles-js" />
      <LanguageSwitcher />
      <div className="min-h-screen flex items-center justify-center p-8 relative">
        <div className="max-w-5xl w-full">
          <motion.h1
            className="text-7xl font-bold text-center mb-6 neon-text"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            {t('title').split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < t('title').split('\n').length - 1 && <br />}
              </span>
            ))}
          </motion.h1>

          <motion.p
            className="text-center text-[var(--neon-cyan)] text-xl mb-16 hand-drawn inline-block px-8 py-4 mx-auto block"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            {t('subtitle')}
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ x: -100, opacity: 0, rotateY: -45 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <Card hover float className="text-center h-full">
                <motion.div
                  className="mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-8xl mb-4 filter drop-shadow-[0_0_20px_rgba(0,255,65,0.8)]">
                    📅
                  </div>
                </motion.div>
                <h2 className="text-4xl font-bold mb-4 text-[var(--neon-green)]">
                  {t('calendar.title')}
                </h2>
                <p className="text-[var(--color-text-dim)] mb-6 text-lg">
                  {t('calendar.description')}
                </p>
                <Link href="/calendar">
                  <Button size="lg" className="w-full">
                    {t('calendar.button')}
                  </Button>
                </Link>
              </Card>
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0, rotateY: 45 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              transition={{ delay: 0.7, type: 'spring' }}
            >
              <Card hover float className="text-center h-full">
                <motion.div
                  className="mb-6"
                  whileHover={{ scale: 1.2, rotate: -10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-8xl mb-4 filter drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]">
                    ✓
                  </div>
                </motion.div>
                <h2 className="text-4xl font-bold mb-4 text-[var(--neon-cyan)]">
                  {t('todos.title')}
                </h2>
                <p className="text-[var(--color-text-dim)] mb-6 text-lg">
                  {t('todos.description')}
                </p>
                <Link href="/todos">
                  <Button size="lg" variant="secondary" className="w-full">
                    {t('todos.button')}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          </div>

          <motion.div
            className="mt-16 text-center text-sm text-[var(--color-text-dim)] hand-drawn p-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-lg mb-2">{t('features.localStorage')}</p>
            <p className="text-lg">{t('features.export')}</p>
          </motion.div>
        </div>
      </div>
    </>
  );
}

// Add particles.js script
if (typeof window !== 'undefined' && !(window as any).particlesJS) {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
  script.async = true;
  document.body.appendChild(script);
}
