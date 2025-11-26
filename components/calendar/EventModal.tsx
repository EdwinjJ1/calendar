'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatISO } from 'date-fns';
import Button from '../ui/Button';
import type { CalendarEvent } from '@/types';
import { LIMITS } from '@/lib/constants';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  initialData?: { start: Date; end: Date };
}

export default function EventModal({ isOpen, onClose, onSave, initialData }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start: initialData?.start || new Date(),
    end: initialData?.end || new Date(),
    allDay: false,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const inputClass = "w-full px-4 py-3 bg-[var(--color-bg-dark)] border-2 border-[var(--neon-green)] rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:border-[var(--neon-cyan)] focus:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all outline-none";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="card-3d p-8 max-w-md w-full border-2 border-[var(--neon-pink)] rounded-2xl shadow-[0_0_50px_rgba(255,0,110,0.5)]"
            initial={{ scale: 0.8, rotateY: -45, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ scale: 0.8, rotateY: 45, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold mb-6 neon-text">✨ New Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Event title 🎉"
                maxLength={LIMITS.MAX_TITLE_LENGTH}
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className={inputClass}
                required
              />
              <textarea
                placeholder="Description"
                maxLength={LIMITS.MAX_DESCRIPTION_LENGTH}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className={inputClass}
                rows={3}
              />
              <input
                type="text"
                placeholder="Location 📍"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-[var(--neon-cyan)] font-bold">⏰ Start</label>
                  <input
                    type="datetime-local"
                    value={formatISO(formData.start, { representation: 'complete' }).slice(0, 16)}
                    onChange={e => setFormData({ ...formData, start: new Date(e.target.value) })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-[var(--neon-cyan)] font-bold">⏰ End</label>
                  <input
                    type="datetime-local"
                    value={formatISO(formData.end, { representation: 'complete' }).slice(0, 16)}
                    onChange={e => setFormData({ ...formData, end: new Date(e.target.value) })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 text-[var(--color-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allDay}
                  onChange={e => setFormData({ ...formData, allDay: e.target.checked })}
                  className="w-5 h-5 accent-[var(--neon-green)]"
                />
                <span className="font-bold">All day event 🌅</span>
              </label>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="secondary" onClick={onClose} size="lg">
                  Cancel
                </Button>
                <Button type="submit" size="lg">💾 Save</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
