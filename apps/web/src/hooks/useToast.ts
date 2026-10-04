'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToastVariant } from '@template/ui';

const TOAST_DURATION_MS = 3000;

export function useToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToastMessage(null);
  }, []);

  const showToast = useCallback(
    (msg: string, variant: ToastVariant = 'success') => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setToastVariant(variant);
      setToastMessage(msg);
      timeoutRef.current = setTimeout(dismissToast, TOAST_DURATION_MS);
    },
    [dismissToast]
  );

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!toastMessage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismissToast();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toastMessage, dismissToast]);

  return { toastMessage, toastVariant, showToast, dismissToast };
}
