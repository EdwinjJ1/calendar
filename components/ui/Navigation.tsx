'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/hooks/useSidebar';

// Icons as components
const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Calendar: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Todos: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Habits: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  Boards: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>,
  Teams: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Chat: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Settings: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
};

interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof Icons;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: 'Home' },
  { href: '/calendar', label: 'Calendar', icon: 'Calendar' },
  { href: '/todos', label: 'Todos', icon: 'Todos' },
  { href: '/habits', label: 'Habits', icon: 'Habits' },
  { href: '/boards', label: 'Boards', icon: 'Boards' },
  { href: '/teams', label: 'Teams', icon: 'Teams' },
  { href: '/chat', label: 'Chat', icon: 'Chat' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isOpen, setIsOpen, isMobileOpen, toggleMobile, closeMobile } = useSidebar();

  return (
    <>
      {/* Mobile Header Bar - Replaces Floating Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-30 flex items-center px-4 border-b border-gray-100 justify-between">
         <button 
           onClick={toggleMobile}
           className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
         >
           {isMobileOpen ? (
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
           ) : (
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
           )}
         </button>
         
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-avocado)] flex items-center justify-center text-white font-bold text-lg">
               T
            </div>
            <span className="font-bold text-lg text-[#1A1A1A]">TODU</span>
         </div>
         
         <div className="w-10" /> {/* Spacer for visual balance */}
      </div>

      {/* Desktop Sidebar */}
      <motion.nav
        className="fixed left-0 top-0 h-screen bg-white border-r border-gray-100 z-40 hidden md:flex flex-col py-8 shadow-2xl"
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ width: '260px' }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="flex flex-col gap-2 px-4">
          <div className="h-16 flex items-center mb-6 pl-4">
             <div className="w-10 h-10 rounded-xl bg-[var(--color-avocado)] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
               T
             </div>
             <span className="ml-3 font-bold text-xl text-[var(--color-text)] tracking-tight whitespace-nowrap">
               TODU
             </span>
          </div>

          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = Icons[item.icon];
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all cursor-pointer overflow-hidden whitespace-nowrap ${
                    isActive
                      ? 'bg-[var(--color-avocado)] text-white shadow-md'
                      : 'hover:bg-gray-50 text-gray-500 hover:text-[var(--color-avocado)]'
                  }`}
                  whileHover={{ scale: 1.02, x: 4 }}
                >
                  <span className="min-w-[24px]">
                    <Icon />
                  </span>
                  <span className="font-medium text-sm">
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
            />
            <motion.nav
              className="fixed left-0 top-0 h-screen w-72 bg-white z-50 md:hidden p-6 shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center gap-3 mb-10 mt-14">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-avocado)] flex items-center justify-center text-white font-bold text-xl">
                    T
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-text)]">TODU</h2>
              </div>
              
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = Icons[item.icon];
                  return (
                    <Link key={item.href} href={item.href} onClick={closeMobile}>
                      <motion.div
                        className={`flex items-center gap-4 px-4 py-4 rounded-2xl ${
                          isActive
                            ? 'bg-[var(--color-avocado)] text-white shadow-md'
                            : 'hover:bg-gray-50 text-gray-500'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon />
                        <span className="font-medium">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
