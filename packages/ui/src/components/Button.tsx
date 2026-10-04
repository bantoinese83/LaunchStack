import React from 'react';
import { cn } from '../utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-medium tracking-tight transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45 rounded-full active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-accent text-white hover:bg-accent-hover border border-transparent shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_24px_-12px_rgba(218,55,80,0.65)]',
      secondary:
        'bg-shell text-paper hover:bg-shell/92 border border-transparent shadow-[0_12px_40px_-20px_rgba(20,19,19,0.55)]',
      outline:
        'border border-line bg-surface text-ink hover:border-ink/25 hover:bg-paper shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]',
      danger: 'bg-danger text-white hover:bg-danger/90 border border-transparent',
      ghost: 'text-muted hover:text-ink hover:bg-ink/[0.05] border border-transparent',
    };

    const sizes = {
      sm: 'h-8 px-3.5 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-[15px] gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
