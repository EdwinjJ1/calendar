'use client';

import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({ 
  onSend, 
  disabled,
  placeholder = 'Type a message...'
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || disabled) return;
    
    onSend(content.trim());
    setContent('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      className="p-4 border-t-2 border-[var(--neon-cyan)]/30 bg-[var(--color-bg-dark)]"
      onSubmit={handleSubmit}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex gap-3 items-end">
        {/* Emoji Button */}
        <motion.button
          type="button"
          className="w-10 h-10 rounded-lg border-2 border-[var(--neon-cyan)]/50 flex items-center justify-center text-xl hover:border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          😊
        </motion.button>

        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 bg-[var(--color-bg)] border-2 border-[var(--neon-cyan)] rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all resize-none disabled:opacity-50"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!content.trim() || disabled}
          className="!px-6"
        >
          <motion.span
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
          >
            🚀
          </motion.span>
        </Button>
      </div>

      {/* Hint */}
      <p className="text-xs text-[var(--color-text-dim)] mt-2 text-center">
        Press <kbd className="px-1 py-0.5 bg-white/10 rounded">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-white/10 rounded">Shift+Enter</kbd> for new line
      </p>
    </motion.form>
  );
}

