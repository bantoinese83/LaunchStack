'use client';

import React, { useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, Check, AlertCircle, Inbox } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Shared field chrome for native selects so they match Input. */
export const fieldSelectClassName =
  'h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50';

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
      'inline-flex items-center justify-center font-medium tracking-tight transition-[background-color,color,border-color,transform,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45 rounded-md active:translate-y-px select-none';

    const variants = {
      primary:
        'bg-accent text-white hover:bg-accent-hover border border-transparent shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]',
      secondary: 'bg-ink text-paper hover:bg-ink/90 border border-transparent',
      outline: 'border border-line bg-surface text-ink hover:border-ink/35 hover:bg-paper',
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
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80" />
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
            'flex h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/65 transition-[border-color,box-shadow] duration-150 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50',
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

export interface AlertProps {
  variant?: 'error' | 'success' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'error', children, className }) => {
  const styles = {
    error: 'border-red-200 bg-red-50 text-danger',
    success: 'border-accent/20 bg-accent-soft text-accent',
    info: 'border-line bg-paper text-muted',
  };
  const Icon = variant === 'success' ? Check : AlertCircle;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm leading-snug',
        styles[variant],
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};

export const Spinner: React.FC<{ className?: string; label?: string }> = ({
  className,
  label = 'Loading',
}) => (
  <span
    role="status"
    aria-label={label}
    className={cn(
      'inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-accent border-t-transparent',
      className
    )}
  />
);

export const PageLoader: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper atlas-grain text-ink">
    <Spinner label={label} />
    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
  </div>
);

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-md border border-dashed border-line bg-surface/60 px-6 py-14 text-center',
      className
    )}
  >
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-line bg-paper text-muted">
      <Inbox className="h-5 w-5" aria-hidden />
    </div>
    <h3 className="font-display text-lg font-semibold tracking-tight text-ink">{title}</h3>
    {description && (
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export interface ToastProps {
  message: string;
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => (
  <div
    role="status"
    className="fixed top-5 right-5 z-50 flex max-w-sm items-center gap-2.5 rounded-md border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-success shadow-[0_12px_32px_-16px_rgba(20,23,20,0.35)] animate-[rise_220ms_ease-out]"
  >
    <Check className="h-4 w-4 shrink-0" aria-hidden />
    <span className="min-w-0 flex-1 leading-snug">{message}</span>
    {onDismiss && (
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-sm p-0.5 text-accent/70 hover:bg-accent/10 hover:text-accent"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="atlas-modal-title"
        className="relative w-full max-w-lg rounded-md border border-line bg-surface p-6 text-ink shadow-[0_24px_60px_-28px_rgba(20,23,20,0.45)] animate-[rise_220ms_ease-out]"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="atlas-modal-title"
              className="font-display text-xl font-semibold tracking-tight text-ink"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-paper hover:text-ink"
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
  <Card className="relative overflow-hidden transition-colors hover:border-ink/20">
    <div className="absolute left-0 top-0 h-full w-[3px] bg-accent" aria-hidden />
    <p className="pl-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</p>
    <div className="mt-2 flex items-baseline justify-between gap-3 pl-2">
      <h3 className="font-display text-3xl font-semibold tracking-tight text-ink">{value}</h3>
      {change && (
        <span
          className={cn(
            'shrink-0 rounded-sm border px-1.5 py-0.5 text-[11px] font-semibold',
            isPositive
              ? 'border-accent/20 bg-accent-soft text-accent'
              : 'border-red-200 bg-red-50 text-danger'
          )}
        >
          {change}
        </span>
      )}
    </div>
    {subtext && <p className="mt-2 pl-2 text-xs leading-relaxed text-muted">{subtext}</p>}
  </Card>
);

export const BrandMark: React.FC<{ size?: 'sm' | 'md'; className?: string }> = ({
  size = 'md',
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center justify-center rounded-sm bg-ink font-display font-bold text-paper',
      size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-sm',
      className
    )}
  >
    LS
  </span>
);
