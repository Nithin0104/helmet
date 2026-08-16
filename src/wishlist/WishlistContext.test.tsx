import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { WishlistProvider, useWishlist } from './WishlistContext';

const STORAGE_KEY = 'apex_wishlist';

function wrapper({ children }: { children: ReactNode }) {
  return <WishlistProvider>{children}</WishlistProvider>;
}

describe('WishlistContext', () => {
  it('starts empty when localStorage has nothing stored', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.ids).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.has('velocity-rs-carbon')).toBe(false);
  });

  it('throws when useWishlist is used outside a WishlistProvider', () => {
    expect(() => renderHook(() => useWishlist())).toThrow(
      /useWishlist must be used within a WishlistProvider/,
    );
  });

  it('adds an id once (idempotent) and derives count/has', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => result.current.add('velocity-rs-carbon'));
    act(() => result.current.add('velocity-rs-carbon'));

    expect(result.current.ids).toEqual(['velocity-rs-carbon']);
    expect(result.current.count).toBe(1);
    expect(result.current.has('velocity-rs-carbon')).toBe(true);
  });

  it('toggle saves an absent id and unsaves a present one', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => result.current.toggle('urban-gt'));
    expect(result.current.has('urban-gt')).toBe(true);

    act(() => result.current.toggle('urban-gt'));
    expect(result.current.has('urban-gt')).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it('remove deletes an id and clear empties everything', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => result.current.add('a'));
    act(() => result.current.add('b'));
    act(() => result.current.remove('a'));
    expect(result.current.ids).toEqual(['b']);

    act(() => result.current.clear());
    expect(result.current.ids).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('persists ids to localStorage and hydrates a new provider instance from them', () => {
    const first = renderHook(() => useWishlist(), { wrapper });
    act(() => first.result.current.add('velocity-rs-carbon'));

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([
      'velocity-rs-carbon',
    ]);

    const second = renderHook(() => useWishlist(), { wrapper });
    expect(second.result.current.has('velocity-rs-carbon')).toBe(true);
  });

  it('falls back to an empty wishlist when localStorage contains corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not valid json');
    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.ids).toEqual([]);
  });

  it('ignores non-string / non-array stored values', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 'ok', null]));
    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.ids).toEqual(['ok']);
  });

  it('falls back to an empty wishlist when localStorage.getItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });

    const { result } = renderHook(() => useWishlist(), { wrapper });

    expect(result.current.ids).toEqual([]);
    spy.mockRestore();
  });
});
