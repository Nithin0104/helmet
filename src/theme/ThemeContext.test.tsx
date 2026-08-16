import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { ACCENTS, ACCENT_KEYS, DEFAULT_ACCENT } from './accents';

const STORAGE_KEY = 'apex_accent';

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

beforeEach(() => {
  // Global localStorage reset lives in tests/setup.ts; document attributes persist
  // across tests within jsdom's single document, so reset that here.
  document.documentElement.removeAttribute('data-accent');
});

describe('ThemeContext', () => {
  it('defaults to DEFAULT_ACCENT when localStorage is empty', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.accentKey).toBe(DEFAULT_ACCENT);
    expect(result.current.accent).toEqual(ACCENTS[DEFAULT_ACCENT]);
  });

  it('throws when useTheme is used outside a ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(/useTheme must be used within a ThemeProvider/);
  });

  it('sets data-accent on <html> on mount', () => {
    renderHook(() => useTheme(), { wrapper });
    expect(document.documentElement.getAttribute('data-accent')).toBe(DEFAULT_ACCENT);
  });

  it.each(ACCENT_KEYS)('setAccent switches to the %s preset and updates data-accent', (key) => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => result.current.setAccent(key));

    expect(result.current.accentKey).toBe(key);
    expect(result.current.accent).toEqual(ACCENTS[key]);
    expect(document.documentElement.getAttribute('data-accent')).toBe(key);
  });

  it('persists the chosen accent to localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setAccent('blue'));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('blue');
  });

  it('hydrates a new provider instance from a previously stored accent', () => {
    window.localStorage.setItem(STORAGE_KEY, 'purple');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.accentKey).toBe('purple');
  });

  it('falls back to DEFAULT_ACCENT when localStorage holds an invalid accent key', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not-a-real-accent');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.accentKey).toBe(DEFAULT_ACCENT);
  });
});
