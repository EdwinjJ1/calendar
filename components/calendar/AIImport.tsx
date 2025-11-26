'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
import Button from '../ui/Button';
import type { CalendarEvent } from '@/types';

interface AIImportProps {
  onImport: (events: CalendarEvent[]) => void;
}

export default function AIImport({ onImport }: AIImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewEvents, setPreviewEvents] = useState<CalendarEvent[]>([]);

  const handleParse = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setPreviewEvents([]);

    try {
      // Use environment variable for API URL in production/mobile builds
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/ai-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          currentDate: new Date().toString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse schedule');
      }

      const events: CalendarEvent[] = data.events.map((e: any) => ({
        ...e,
        id: nanoid(),
        start: new Date(e.start),
        end: new Date(e.end),
      }));

      setPreviewEvents(events);
    } catch (error) {
      console.error('Parse error:', error);
      alert('Failed to parse schedule. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    onImport(previewEvents);
    setIsOpen(false);
    setText('');
    setPreviewEvents([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="secondary">
        🤖 AI Import from Markdown
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="card-3d p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-[var(--neon-cyan)] rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.5)]"
              initial={{ scale: 0.8, rotateY: -45, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.8, rotateY: 45, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-6 neon-text">🤖 AI Calendar Import</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-[var(--neon-green)] font-bold mb-2">
                    📁 Upload Markdown File
                  </label>
                  <input
                    type="file"
                    accept=".md,.markdown,.txt"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-3 bg-[var(--color-bg-dark)] border-2 border-[var(--neon-green)] rounded-xl text-[var(--color-text)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--neon-green)] file:text-[var(--color-bg)] file:font-bold hover:file:opacity-80"
                  />
                </div>

                <div className="text-center text-[var(--color-text-dim)]">OR</div>

                <div>
                  <label className="block text-[var(--neon-green)] font-bold mb-2">
                    ✍️ Paste Your Schedule
                  </label>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Describe your schedule naturally...&#10;&#10;Examples:&#10;- Meeting with Team A tomorrow at 2 PM for 1 hour&#10;- Study session on Monday morning from 9 to 11"
                    className="w-full h-64 px-4 py-3 bg-[var(--color-bg-dark)] border-2 border-[var(--neon-cyan)] rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:border-[var(--neon-green)] focus:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all outline-none font-mono text-sm"
                  />
                </div>

                <Button 
                  onClick={handleParse} 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading || !text}
                >
                  {isLoading ? '🔮 Parsing with AI...' : '🔮 Parse Schedule'}
                </Button>

                {previewEvents.length > 0 && (
                  <motion.div
                    className="mt-6 p-4 bg-[var(--color-bg-dark)] border-2 border-[var(--neon-pink)] rounded-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <h3 className="text-xl font-bold mb-4 text-[var(--neon-pink)]">
                      ✨ Found {previewEvents.length} Events:
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {previewEvents.map((event, i) => (
                        <div
                          key={i}
                          className="p-3 bg-[var(--color-bg)] border border-[var(--neon-green)] rounded-lg"
                        >
                          <div className="font-bold text-[var(--neon-green)]">{event.title}</div>
                          <div className="text-sm text-[var(--color-text-dim)]">
                            {event.start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {event.description && (
                            <div className="text-sm text-[var(--neon-cyan)] mt-1">{event.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button onClick={() => setPreviewEvents([])} variant="danger" className="flex-1">
                        ❌ Clear
                      </Button>
                      <Button onClick={handleImport} className="flex-1" size="lg">
                        📥 Import All
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button onClick={() => setIsOpen(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
