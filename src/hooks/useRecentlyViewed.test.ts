import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRecentlyViewed } from './useRecentlyViewed';

const KEY = 'apex_recently_viewed';

describe('useRecentlyViewed', () => {
  beforeEach(() => localStorage.clear());

  it('records the current product and excludes it from the returned list', () => {
    const { result } = renderHook(() => useRecentlyViewed('a'));
    expect(result.current).not.toContain('a');
    expect(JSON.parse(localStorage.getItem(KEY)!)).toContain('a');
  });

  it('returns previously-viewed products, most-recent-first, excluding the current', () => {
    localStorage.setItem(KEY, JSON.stringify(['b', 'c']));
    const { result } = renderHook(() => useRecentlyViewed('a'));
    expect(result.current).toEqual(['b', 'c']);
  });

  it('moves a re-viewed product to the front without duplicating it', () => {
    localStorage.setItem(KEY, JSON.stringify(['b', 'c', 'a']));
    renderHook(() => useRecentlyViewed('c'));
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['c', 'b', 'a']);
  });

  it('caps the returned list at the given size', () => {
    localStorage.setItem(KEY, JSON.stringify(['b', 'c', 'd', 'e', 'f']));
    const { result } = renderHook(() => useRecentlyViewed('a', 3));
    expect(result.current).toHaveLength(3);
  });

  it('is a no-op read when no current id is given', () => {
    localStorage.setItem(KEY, JSON.stringify(['b', 'c']));
    const { result } = renderHook(() => useRecentlyViewed(undefined));
    expect(result.current).toEqual(['b', 'c']);
  });

  it('recovers from corrupted storage without throwing', () => {
    localStorage.setItem(KEY, '{not json');
    const { result } = renderHook(() => useRecentlyViewed('a'));
    expect(result.current).toEqual([]);
  });
});
