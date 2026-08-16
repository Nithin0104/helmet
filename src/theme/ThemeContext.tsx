/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ACCENTS, DEFAULT_ACCENT } from './accents';
import type { AccentKey, AccentDef } from './accents';

const STORAGE_KEY = 'apex_accent';

interface ThemeContextValue {
  accent: AccentDef;
  accentKey: AccentKey;
  setAccent: (key: AccentKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredAccent(): AccentKey {
  if (typeof window === 'undefined') return DEFAULT_ACCENT;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && stored in ACCENTS ? (stored as AccentKey) : DEFAULT_ACCENT;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accentKey, setAccentKey] = useState<AccentKey>(readStoredAccent);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentKey);
    window.localStorage.setItem(STORAGE_KEY, accentKey);
  }, [accentKey]);

  return (
    <ThemeContext.Provider
      value={{ accent: ACCENTS[accentKey], accentKey, setAccent: setAccentKey }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
