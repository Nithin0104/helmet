import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery, useIsDesktop } from './useMediaQuery';

type Listener = (event: MediaQueryListEvent) => void;

function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<Listener>();

  const mql = {
    get matches() {
      return matches;
    },
    media: '',
    onchange: null,
    addEventListener: vi.fn((_event: string, listener: Listener) => listeners.add(listener)),
    removeEventListener: vi.fn((_event: string, listener: Listener) => listeners.delete(listener)),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  window.matchMedia = vi.fn().mockReturnValue(mql);

  return {
    setMatches(next: boolean) {
      matches = next;
      listeners.forEach((listener) => listener({} as MediaQueryListEvent));
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useMediaQuery', () => {
  it('returns the initial matchMedia() result', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 800px)'));
    expect(result.current).toBe(true);
  });

  it('updates when the media query change event fires', () => {
    const { setMatches } = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 800px)'));

    expect(result.current).toBe(false);
    act(() => setMatches(true));
    expect(result.current).toBe(true);
  });

  it('subscribes and unsubscribes the change listener', () => {
    mockMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 800px)'));
    const mql = window.matchMedia('(min-width: 800px)');
    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});

describe('useIsDesktop', () => {
  it('queries the documented 800px breakpoint', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 800px)');
  });
});
