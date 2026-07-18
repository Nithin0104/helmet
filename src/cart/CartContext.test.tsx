import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CartProvider, useCart } from './CartContext';
import type { CartLineInput } from './CartContext';

const STORAGE_KEY = 'apex_cart';

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

const baseLine: CartLineInput = {
  productId: 'velocity-rs-carbon',
  name: 'Velocity RS Carbon',
  brand: 'Apexline',
  price: 42999,
};

describe('CartContext', () => {
  it('starts empty when localStorage has nothing stored', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.lines).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('throws when useCart is used outside a CartProvider', () => {
    expect(() => renderHook(() => useCart())).toThrow(/useCart must be used within a CartProvider/);
  });

  it('adds a new line and derives count/subtotal', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(baseLine));

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0]).toMatchObject({ ...baseLine, qty: 1 });
    expect(result.current.count).toBe(1);
    expect(result.current.subtotal).toBe(42999);
  });

  it('merges quantity when the same productId|color|size is added again', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add({ ...baseLine, color: 'matte-black', size: 'm' }));
    act(() => result.current.add({ ...baseLine, color: 'matte-black', size: 'm' }, 2));

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].qty).toBe(3);
    expect(result.current.count).toBe(3);
  });

  it('treats different color/size combinations as distinct lines', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add({ ...baseLine, color: 'matte-black', size: 'm' }));
    act(() => result.current.add({ ...baseLine, color: 'racing-red', size: 'm' }));

    expect(result.current.lines).toHaveLength(2);
    expect(result.current.count).toBe(2);
  });

  it('setQty updates an existing line quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(baseLine));
    const id = result.current.lines[0].id;
    act(() => result.current.setQty(id, 5));

    expect(result.current.lines[0].qty).toBe(5);
    expect(result.current.count).toBe(5);
  });

  it('setQty with a value <= 0 removes the line', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(baseLine));
    const id = result.current.lines[0].id;
    act(() => result.current.setQty(id, 0));

    expect(result.current.lines).toEqual([]);
  });

  it('remove deletes a line by id', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(baseLine));
    const id = result.current.lines[0].id;
    act(() => result.current.remove(id));

    expect(result.current.lines).toEqual([]);
  });

  it('clear empties all lines', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add({ ...baseLine, color: 'a' }));
    act(() => result.current.add({ ...baseLine, color: 'b' }));
    act(() => result.current.clear());

    expect(result.current.lines).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('persists lines to localStorage and hydrates a new provider instance from them', () => {
    const first = renderHook(() => useCart(), { wrapper });
    act(() => first.result.current.add(baseLine, 2));

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toHaveLength(1);

    const second = renderHook(() => useCart(), { wrapper });
    expect(second.result.current.lines).toHaveLength(1);
    expect(second.result.current.lines[0].qty).toBe(2);
  });

  it('falls back to an empty cart when localStorage contains corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not valid json');

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.lines).toEqual([]);
  });

  it('falls back to an empty cart when localStorage.getItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.lines).toEqual([]);
    spy.mockRestore();
  });
});
