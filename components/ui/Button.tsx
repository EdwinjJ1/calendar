import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', glow = true, className = '', children, ...props }, ref) => {
    const baseStyles = 'font-bold transition-all duration-300 disabled:opacity-50 relative overflow-hidden';

    const variants = {
      primary: 'bg-[var(--neon-green)] text-[var(--color-bg)] border-2 border-[var(--neon-green)] hover:bg-transparent hover:text-[var(--neon-green)]',
      secondary: 'bg-transparent text-[var(--neon-cyan)] border-2 border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)] hover:text-[var(--color-bg)]',
      danger: 'bg-[var(--neon-pink)] text-[var(--color-bg)] border-2 border-[var(--neon-pink)] hover:bg-transparent hover:text-[var(--neon-pink)]',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-2xl',
    };

    const glowClass = glow ? 'shadow-[0_0_20px_rgba(0,255,65,0.5)] hover:shadow-[0_0_40px_rgba(0,255,65,0.8)]' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glowClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
