import React from 'react';
import { cn } from '../utils';

/** Shared field chrome for native selects so they match Input. */
export const fieldSelectClassName =
  'h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50';

export const fieldSelectDarkClassName =
  'h-10 w-full rounded-lg border border-white/12 bg-white/5 px-3 text-sm text-paper transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50';

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
            className="block font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'flex h-11 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60 transition-[border-color,box-shadow] duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger focus:border-danger focus:ring-danger/25',
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
