'use client';

import React, { useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// BUTTON
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
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 rounded-lg active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-500/20 border border-blue-500/30',
      secondary:
        'bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-900 border border-slate-700/80',
      outline:
        'border border-slate-700 bg-slate-950/40 text-slate-200 hover:bg-slate-800/80 hover:text-white',
      danger:
        'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-md shadow-red-500/20',
      ghost: 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// CARD
export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md p-6 shadow-xl text-slate-100 transition-all hover:border-slate-700/80',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// INPUT
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
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'flex h-10 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// BADGE
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

export const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
  const styles = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
    success:
      'bg-emerald-950/80 text-emerald-400 border-emerald-800/60 shadow-sm shadow-emerald-500/10',
    warning: 'bg-amber-950/80 text-amber-400 border-amber-800/60 shadow-sm shadow-amber-500/10',
    danger: 'bg-rose-950/80 text-rose-400 border-rose-800/60 shadow-sm shadow-rose-500/10',
    info: 'bg-sky-950/80 text-sky-400 border-sky-800/60 shadow-sm shadow-sky-500/10',
    purple: 'bg-purple-950/80 text-purple-400 border-purple-800/60 shadow-sm shadow-purple-500/10',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide capitalize',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// MODAL PRIMITIVE
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100 transform transition-all animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// AVATAR PRIMITIVE
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
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover border border-slate-700', sizes[size])}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 font-bold text-white shadow-md border border-white/10',
        sizes[size]
      )}
    >
      {initials}
    </div>
  );
};

// STATS CARD PRIMITIVE
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
  <Card className="relative overflow-hidden group hover:border-blue-500/40">
    <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/10 rounded-bl-full transition-transform group-hover:scale-110" />
    <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">{title}</p>
    <div className="flex items-baseline justify-between mt-2">
      <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
      {change && (
        <span
          className={cn(
            'text-xs font-bold px-2 py-0.5 rounded-full',
            isPositive
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
              : 'bg-rose-950 text-rose-400 border border-rose-800/50'
          )}
        >
          {isPositive ? '↑' : '↓'} {change}
        </span>
      )}
    </div>
    {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
  </Card>
);
