/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useToast } from './useToast';

describe('useToast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('auto-dismisses after three seconds', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Saved');
    });
    expect(result.current.toastMessage).toBe('Saved');

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.toastMessage).toBeNull();
  });

  test('dismissToast clears message immediately', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Saved');
    });
    act(() => {
      result.current.dismissToast();
    });

    expect(result.current.toastMessage).toBeNull();
  });

  test('tracks toast variant for error feedback', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Something went wrong', 'error');
    });

    expect(result.current.toastVariant).toBe('error');
  });

  test('Escape dismisses an open toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Saved');
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.toastMessage).toBeNull();
  });
});
