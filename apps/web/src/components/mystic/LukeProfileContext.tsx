'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { LukeProfileSheet } from '@/components/mystic/LukeProfileSheet';

type LukeProfileContextValue = {
  openLukeProfile: () => void;
};

const LukeProfileContext = createContext<LukeProfileContextValue | null>(null);

export function LukeProfileProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openLukeProfile = useCallback(() => setOpen(true), []);

  const value = useMemo(() => ({ openLukeProfile }), [openLukeProfile]);

  return (
    <LukeProfileContext.Provider value={value}>
      {children}
      <LukeProfileSheet open={open} onClose={() => setOpen(false)} />
    </LukeProfileContext.Provider>
  );
}

export function useLukeProfile() {
  const ctx = useContext(LukeProfileContext);
  if (!ctx) {
    throw new Error('useLukeProfile must be used within LukeProfileProvider');
  }
  return ctx;
}
