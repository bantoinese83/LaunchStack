'use client';

import React, { useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
      'inline-flex items-center justify-center font-medium tracking-tight transition-[background-color,color,border-color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45 rounded-md active:translate-y-px select-none';

    const variants = {
      primary: 'bg-accent text-white hover:bg-accent-hover border border-transparent',
      secondary: 'bg-ink text-paper hover:bg-ink/90 border border-transparent',
      outline: 'border border-line bg-surface text-ink hover:border-ink/40 hover:bg-paper',
      danger: 'bg-danger text-white hover:bg-danger/90 border border-transparent',
      ghost: 'text-muted hover:text-ink hover:bg-ink/[0.04] border border-transparent',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-5 text-[15px] gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('rounded-md border border-line bg-surface p-6 text-ink', className)}
    {...props}
  >
    {children}
  </div>
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'flex h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger focus:border-danger focus:ring-danger',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

export const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
  const styles = {
    default: 'bg-paper text-muted border-line',
    success: 'bg-accent-soft text-accent border-accent/20',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-danger border-red-200',
    info: 'bg-accent-soft text-accent border-accent/20',
    purple: 'bg-paper text-ink border-line',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-[0.08em] uppercase',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
      <div className="relative w-full max-w-lg rounded-md border border-line bg-surface p-6 text-ink shadow-[0_24px_60px_-28px_rgba(20,23,20,0.45)] animate-[rise_220ms_ease-out]">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{title}</h2>
            {description && <p className="text-sm text-muted mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-paper hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizes = {
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-12 w-12 text-sm',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-md object-cover border border-line', sizes[size])}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-md bg-ink font-display font-semibold text-paper',
        sizes[size]
      )}
    >
      {initials}
    </div>
  );
};

export interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  subtext,
}) => (
  <Card className="relative overflow-hidden">
    <div className="absolute left-0 top-0 h-full w-[3px] bg-accent" />
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted pl-2">{title}</p>
    <div className="flex items-baseline justify-between mt-2 pl-2">
      <h3 className="font-display text-3xl font-semibold tracking-tight text-ink">{value}</h3>
      {change && (
        <span
          className={cn(
            'text-[11px] font-semibold px-1.5 py-0.5 rounded-sm border',
            isPositive
              ? 'bg-accent-soft text-accent border-accent/20'
              : 'bg-red-50 text-danger border-red-200'
          )}
        >
          {isPositive ? '+' : '−'} {change}
        </span>
      )}
    </div>
    {subtext && <p className="text-xs text-muted mt-2 pl-2">{subtext}</p>}
  </Card>
);
