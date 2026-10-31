'use client';

import Link from 'next/link';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { Route } from 'next';
import { MagneticButton } from '@/components/ui/magnetic-button';
import {
  mysticBtn3dPrimary,
  mysticBtn3dPrimarySm,
  mysticBtn3dSecondary,
  mysticBtn3dSecondaryOnDark,
  mysticBtn3dSecondarySm,
} from './mystic-styles';

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

type Variant = 'primary' | 'secondary';
type Size = 'default' | 'sm';
type Surface = 'paper' | 'dark';

function faceClass(variant: Variant, size: Size, surface: Surface) {
  if (variant === 'primary' && size === 'sm') return mysticBtn3dPrimarySm;
  if (variant === 'primary') return mysticBtn3dPrimary;
  if (surface === 'dark') return mysticBtn3dSecondaryOnDark;
  if (size === 'sm') return mysticBtn3dSecondarySm;
  return mysticBtn3dSecondary;
}

function MagneticShell({
  children,
  className,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return <span className={cn('inline-block', className)}>{children}</span>;
  }

  return (
    <MagneticButton className={cn('inline-block', className)} strength={0.32}>
      {children}
    </MagneticButton>
  );
}

type MysticMagneticLinkProps = {
  href: Route;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  surface?: Surface;
  faceClassName?: string;
  className?: string;
  children: ReactNode;
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'className' | 'children'>;

export function MysticMagneticLink({
  href,
  variant = 'primary',
  size = 'default',
  surface = 'paper',
  fullWidth,
  faceClassName,
  className,
  children,
  ...props
}: MysticMagneticLinkProps) {
  return (
    <MagneticShell className={cn(fullWidth && 'block w-full', className)}>
      <Link
        href={href}
        className={cn(faceClass(variant, size, surface), faceClassName, fullWidth && 'w-full')}
        {...props}
      >
        <span className="mystic-btn-3d-label inline-flex items-center justify-center gap-2">
          {children}
        </span>
      </Link>
    </MagneticShell>
  );
}

type MysticMagneticButtonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  surface?: Surface;
  faceClassName?: string;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function MysticMagneticButton({
  variant = 'primary',
  size = 'default',
  surface = 'paper',
  fullWidth,
  faceClassName,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: MysticMagneticButtonProps) {
  return (
    <MagneticShell className={cn(fullWidth && 'block w-full', className)} disabled={disabled}>
      <button
        type={type}
        disabled={disabled}
        className={cn(faceClass(variant, size, surface), faceClassName, fullWidth && 'w-full')}
        {...props}
      >
        <span className="mystic-btn-3d-label inline-flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    </MagneticShell>
  );
}

export function MysticMagneticAnchor({
  href,
  variant = 'secondary',
  size = 'default',
  surface = 'paper',
  faceClassName,
  className,
  children,
  ...props
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  surface?: Surface;
  faceClassName?: string;
  className?: string;
  children: ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <MagneticShell className={className}>
      <a href={href} className={cn(faceClass(variant, size, surface), faceClassName)} {...props}>
        <span className="mystic-btn-3d-label inline-flex items-center justify-center gap-2">
          {children}
        </span>
      </a>
    </MagneticShell>
  );
}
