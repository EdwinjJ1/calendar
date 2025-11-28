'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';

type TabType = 'daily' | 'weekly' | 'monthly' | 'quarterly';

const TABS: { label: string; value: TabType }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
];

export default function HabitsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('daily');

  return (
    <>
      <div className="min-h-screen p-6 md:p-8 bg-[var(--color-bg)]">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Habits</h1>
          </header>

          {/* Tabs */}
          <div className="flex bg-white p-1 rounded-full shadow-sm mb-8">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-200 ${
                  activeTab === tab.value
                    ? 'bg-[var(--color-bg-card-dark)] text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Hero Card */}
          <Card variant="dark" className="p-8 mb-8 relative overflow-hidden border-none">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Keep It Up</h2>
                  <p className="text-gray-400 text-xs font-medium leading-relaxed tracking-wide uppercase">
                    Developing Good Habits
                  </p>
                </div>
                <span className="bg-[var(--color-avocado)] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  25 Days
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mt-8">
                 <div className="h-2 w-2 rounded-full bg-[var(--color-avocado)]"></div>
                 <div className="h-2 w-2 rounded-full bg-white/20"></div>
                 <div className="h-2 w-2 rounded-full bg-white/20"></div>
                 <div className="h-2 w-2 rounded-full bg-white/20"></div>
                 <div className="h-2 w-2 rounded-full bg-white/20"></div>
              </div>
            </div>
            
            {/* Decorative Trophy Icon */}
            <div className="absolute -right-6 -bottom-6 text-white/5 transform rotate-[-15deg]">
               <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor"><path d="M8 21H16M12 17V21M12 17C14.7614 17 17 14.7614 17 12V5H7V12C7 14.7614 9.23858 17 12 17ZM17 7V10C17 10.5523 17.4477 11 18 11C18.5523 11 19 10.5523 19 10V7M7 7V10C7 10.5523 6.55228 11 6 11C5.44772 11 5 10.5523 5 10V7"/></svg>
            </div>
          </Card>

          {/* Habit List */}
          <div className="space-y-4">
            {[
              { title: 'Practice Yoga', days: '25 Days', completed: false },
              { title: 'Drink Water', days: '21 Days', completed: true },
              { title: 'Evening Run', days: '25 Days', completed: true },
            ].map((habit, i) => (
                <Card 
                  key={i} 
                  hover 
                  className="flex justify-between items-center group border-none"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${habit.completed ? 'bg-[var(--color-avocado)] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {habit.completed ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-current" />
                      )}
                    </div>
                    <span className="font-bold text-sm text-[#1A1A1A]">
                      {habit.title}
                    </span>
                  </div>
                  <span className="bg-[#1A1A1A] text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                    {habit.days}
                  </span>
                </Card>
            ))}
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-8 right-8 md:absolute md:bottom-8 md:right-0 md:left-0 flex justify-center z-50">
            <button className="h-14 w-14 md:w-auto md:px-8 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span className="hidden md:inline ml-2 font-bold">New Habit</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}