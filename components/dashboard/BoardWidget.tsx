'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BoardWidget() {
  return (
    <Link href="/boards" className="block w-full">
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="relative w-full h-48 rounded-[32px] overflow-hidden shadow-lg group"
        style={{
          background: '#1A1A1A',
        }}
      >
         {/* Trapezoid Shape Mask / Decoration */}
         <div 
           className="absolute top-0 right-0 w-[60%] h-full bg-[#6C8F32] opacity-90 transition-transform duration-500 group-hover:scale-105"
           style={{
             clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)'
           }}
         />
         
         <div className="absolute inset-0 p-8 flex flex-col justify-between relative z-10">
           <div className="flex justify-between items-start">
             <div>
               <h2 className="text-3xl font-bold text-white mb-1">Task Board</h2>
               <p className="text-gray-400 font-medium">12 Tasks Pending</p>
             </div>
             
             <div className="bg-white/10 p-3 rounded-full backdrop-blur-md">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
             </div>
           </div>

           <div className="flex items-end gap-2">
             <div className="flex -space-x-3">
               {[1,2,3].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1A1A1A] bg-gray-600 flex items-center justify-center text-xs text-white">
                   U{i}
                 </div>
               ))}
               <div className="w-10 h-10 rounded-full border-2 border-[#1A1A1A] bg-[#2a2a2a] flex items-center justify-center text-xs text-white font-bold">
                 +4
               </div>
             </div>
           </div>
         </div>
         
         {/* Decorative abstract shape to enhance 'trapezoid' feel if clip-path isn't enough */}
         <div className="absolute bottom-4 right-6 text-white/20">
           <svg width="80" height="40" viewBox="0 0 100 50">
             <path d="M0 50 L20 0 L100 0 L100 50 Z" fill="currentColor" />
           </svg>
         </div>
      </motion.div>
    </Link>
  );
}
