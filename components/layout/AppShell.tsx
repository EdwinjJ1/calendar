'use client';

import { useSidebar } from '@/hooks/useSidebar';
import Navigation from '@/components/ui/Navigation';
import { motion } from 'framer-motion';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <>
      <Navigation />
      
      {/* Invisible Trigger Area */}
      <div 
        className="fixed top-0 left-0 h-screen w-4 z-50 hidden md:block"
        onMouseEnter={() => setIsOpen(true)}
      />

      {/* Main Content Wrapper */}
      <motion.main
        className="min-h-screen w-full pt-16 md:pt-0"
        initial={{ marginLeft: 0 }}
        animate={{ marginLeft: isOpen ? '260px' : '0px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.main>
    </>
  );
}