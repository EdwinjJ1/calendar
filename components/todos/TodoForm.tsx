'use client';

import { useState, useRef, useEffect } from 'react';
import { formatISO } from 'date-fns';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { TodoItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface TodoFormProps {
  onAdd: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      completed: false,
      priority,
      categories: [],
    });

    setTitle('');
    setIsExpanded(false);
    setPriority('medium');
  };

  return (
    <Card className="bg-[var(--color-bg-card-dark)] text-white shadow-xl border border-white/5" padding="none">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center p-2">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Add a new task..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-3 outline-none text-lg"
          />
          <AnimatePresence>
            {(isExpanded || title) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button 
                  type="submit" 
                  size="icon"
                  className="bg-[var(--color-avocado)] hover:bg-[var(--color-avocado-light)] text-white mr-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10"
            >
              <div className="p-3 flex gap-2 justify-end">
                 {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p as any)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors uppercase tracking-wider ${
                        priority === p 
                          ? 'bg-white text-black' 
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {p}
                    </button>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Card>
  );
}