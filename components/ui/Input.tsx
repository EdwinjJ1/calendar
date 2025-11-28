'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  color?: 'green' | 'cyan' | 'pink' | 'yellow';
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  color?: 'green' | 'cyan' | 'pink' | 'yellow';
}

const colorMap = {
  green: 'var(--neon-green)',
  cyan: 'var(--neon-cyan)',
  pink: 'var(--neon-pink)',
  yellow: 'var(--neon-yellow)',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, color = 'cyan', className = '', ...props }, ref) => {
    const colorValue = colorMap[color];
    
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text-dim)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-[var(--color-bg-dark)] border-2 rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none transition-all ${className}`}
          style={{
            borderColor: error ? 'var(--neon-pink)' : colorValue,
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = `0 0 20px ${colorValue}80`;
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
        {error && (
          <p className="text-sm text-[var(--neon-pink)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, color = 'cyan', className = '', ...props }, ref) => {
    const colorValue = colorMap[color];
    
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text-dim)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-3 bg-[var(--color-bg-dark)] border-2 rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none transition-all resize-none ${className}`}
          style={{
            borderColor: error ? 'var(--neon-pink)' : colorValue,
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = `0 0 20px ${colorValue}80`;
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
        {error && (
          <p className="text-sm text-[var(--neon-pink)]">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;

