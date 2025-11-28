import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-avocado)] disabled:opacity-50 disabled:pointer-events-none active:scale-95';

    const variants = {
      primary: 'bg-[var(--color-avocado)] text-white hover:bg-[var(--color-avocado-dark)] border border-transparent shadow-md hover:shadow-lg',
      secondary: 'bg-white text-[var(--color-avocado)] hover:bg-gray-50 border border-gray-100 shadow-sm',
      outline: 'bg-transparent border-2 border-[var(--color-avocado)] text-[var(--color-avocado)] hover:bg-[var(--color-avocado)] hover:text-white',
      ghost: 'bg-transparent text-[var(--color-text)] hover:bg-gray-100/50',
      danger: 'bg-[var(--color-danger)] text-white hover:opacity-90 border border-transparent',
      dark: 'bg-[var(--color-bg-card-dark)] text-white hover:opacity-90 shadow-md',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-[var(--radius-sm)]',
      md: 'h-11 px-5 py-2 text-base rounded-[var(--radius-md)]',
      lg: 'h-14 px-8 text-lg rounded-[var(--radius-lg)]',
      icon: 'h-10 w-10 p-0 rounded-full',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
