import { describe, expect, test } from 'vitest';
import { resolveMysticBreadcrumbs, resolveStudioBreadcrumbs } from './breadcrumbs';

describe('resolveMysticBreadcrumbs', () => {
  test('returns null for home', () => {
    expect(resolveMysticBreadcrumbs('/')).toBeNull();
  });

  test('maps client routes with friendly labels', () => {
    expect(resolveMysticBreadcrumbs('/memberships')).toEqual([
      { href: '/', label: 'Home' },
      { href: '/memberships', label: 'Plans' },
    ]);
    expect(resolveMysticBreadcrumbs('/book/success')).toEqual([
      { href: '/', label: 'Home' },
      { href: '/book', label: 'Book' },
      { href: '/book/success', label: 'Confirmation' },
    ]);
  });

  test('includes marketing legal pages', () => {
    expect(resolveMysticBreadcrumbs('/privacy')).toEqual([
      { href: '/', label: 'Home' },
      { href: '/privacy', label: 'Privacy' },
    ]);
  });

  test('ignores unknown top-level routes', () => {
    expect(resolveMysticBreadcrumbs('/login')).toBeNull();
  });
});

describe('resolveStudioBreadcrumbs', () => {
  test('studio home', () => {
    expect(resolveStudioBreadcrumbs('/studio')).toEqual([
      { href: '/', label: 'Home' },
      { href: '/studio', label: 'Studio' },
    ]);
  });

  test('nested studio page', () => {
    expect(resolveStudioBreadcrumbs('/studio/calendar')).toEqual([
      { href: '/', label: 'Home' },
      { href: '/studio', label: 'Studio' },
      { href: '/studio/calendar', label: 'Calendar' },
    ]);
  });
});
