import { describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from './useDocumentTitle';

afterEach(() => {
  document.title = '';
  document.querySelector('meta[name="description"]')?.remove();
});

describe('useDocumentTitle', () => {
  it('sets a suffixed document title', () => {
    renderHook(() => useDocumentTitle('Helmets'));
    expect(document.title).toBe('Helmets | APEXLINE');
  });

  it('adds a meta description when given one', () => {
    renderHook(() => useDocumentTitle('Helmets', 'Shop helmets.'));
    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute('content')).toBe('Shop helmets.');
  });

  it('restores the previous title on unmount', () => {
    document.title = 'APEXLINE';
    const { unmount } = renderHook(() => useDocumentTitle('Helmets'));
    expect(document.title).toBe('Helmets | APEXLINE');
    unmount();
    expect(document.title).toBe('APEXLINE');
  });

  it('removes a meta description it created on unmount', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Helmets', 'Shop helmets.'));
    expect(document.querySelector('meta[name="description"]')).not.toBeNull();
    unmount();
    expect(document.querySelector('meta[name="description"]')).toBeNull();
  });
});
