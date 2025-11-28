'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

// Generate deterministic "random" event indicators based on day
const hasEvent = (day: Date): boolean => {
  const dayNum = day.getDate();
  const monthNum = day.getMonth();
  // Deterministic pseudo-random based on day and month
  return (dayNum * 7 + monthNum * 13) % 5 === 0;
};

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // Compute calendar days directly - React Compiler will optimize this
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-4">
        {WEEK_DAYS.map((day, index) => (
          <div key={`${index}-${day}`} className="text-center text-sm font-bold text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 flex-1">
        {calendarDays.map((day) => {
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);
          const showEventDot = isCurrentMonth && hasEvent(day) && !isToday;

          return (
            <div key={day.toString()} className="flex justify-center items-center relative">
              <div
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-[#1A1A1A]'}
                  ${isToday ? 'bg-[var(--color-avocado)] text-white shadow-md' : ''}
                `}
              >
                {format(day, 'd')}
              </div>

              {/* Event Indicator Dot */}
              {showEventDot && (
                 <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--color-avocado)]"></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend / Status */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
         <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-[var(--color-avocado)]"></span>
           <span>Events</span>
         </div>
         <span className="text-[var(--color-avocado)] font-semibold cursor-pointer hover:underline">View Full</span>
      </div>
    </div>
  );
}
