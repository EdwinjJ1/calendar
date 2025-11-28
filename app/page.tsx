'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import BoardWidget from '@/components/dashboard/BoardWidget';
import MiniCalendar from '@/components/dashboard/MiniCalendar';
import Card from '@/components/ui/Card';

export default function Dashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <>
      <div className="min-h-screen p-6 md:p-8 bg-[var(--color-bg)] font-sans">
        <div className="max-w-md mx-auto h-full flex flex-col gap-6">
          
          {/* Header */}
          <header className="flex justify-between items-center py-2">
             <h1 className="text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
             <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                {/* Avatar Placeholder */}
                <div className="w-full h-full bg-[var(--color-avocado)] text-white flex items-center justify-center font-bold">U</div>
             </div>
          </header>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6 flex-1 pb-10"
          >
            {/* 1. Board Widget (Top) - Trapezoid Style */}
            <motion.div variants={itemVariants}>
              <BoardWidget />
            </motion.div>

            {/* 2. Group & Todo (Middle) - Side by Side Squares */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6 h-48">
              {/* Group Card */}
              <Link href="/teams" className="h-full">
                <Card hover className="h-full !bg-[var(--color-avocado)] !text-white flex flex-col items-center justify-center p-6 shadow-sm border-none relative overflow-hidden group">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h3 className="text-lg font-bold !text-white">Groups</h3>
                  <p className="text-xs !text-white/90 mt-1">3 Active Teams</p>
                </Card>
              </Link>

              {/* Todo Card */}
              <Link href="/todos" className="h-full">
                <Card hover className="h-full !bg-[#1A1A1A] !text-white flex flex-col items-center justify-center p-6 shadow-lg border-none relative overflow-hidden group">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  </div>
                  <h3 className="text-lg font-bold !text-white drop-shadow-md">Todos</h3>
                  <p className="text-xs !text-white/90 mt-1 font-medium">8 Tasks Today</p>
                </Card>
              </Link>
            </motion.div>

            {/* 3. Calendar (Bottom) - Full Width */}
            <motion.div variants={itemVariants} className="min-h-[320px]">
              <Link href="/calendar" className="block h-full">
                 <MiniCalendar />
              </Link>
            </motion.div>

            {/* 4. Quick Actions (New Section for Missing Links) */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { title: 'Chat', icon: '💬', href: '/chat', color: 'bg-pink-50 text-pink-600' },
                  { title: 'Habits', icon: '🔥', href: '/habits', color: 'bg-orange-50 text-orange-600' },
                  { title: 'Boards', icon: '📋', href: '/boards', color: 'bg-yellow-50 text-yellow-600' },
                  { title: 'Settings', icon: '⚙️', href: '/settings', color: 'bg-gray-100 text-gray-600' },
                ].map((item) => (
                  <Link href={item.href} key={item.title}>
                    <div className="flex flex-col items-center gap-2 group">
                      <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform`}>
                        {item.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-600 group-hover:text-black">{item.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </>
  );
}