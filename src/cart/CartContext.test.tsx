import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { StrictMode } from 'react';
import type { ReactNode } from 'react';
import { CartProvider, useCart } from './CartContext';
import type { CartLineInput } from './CartContext';

const STORAGE_KEY = 'apex_cart';

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

// StrictMode double-invokes state updaters to surface impure ones. The bag ⇄ saved
// moves must survive that without doubling quantities.
function strictWrapper({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <CartProvider>{children}</CartProvider>
    </StrictMode>
  );
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

describe('CartContext — saved for later', () => {
  it('save moves a bag line into saved with quantity reset to 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(baseLine, 3));
    const id = result.current.lines[0].id;
    act(() => result.current.save(id));

    expect(result.current.lines).toEqual([]);
    expect(result.current.saved).toHaveLength(1);
    expect(result.current.saved[0]).toMatchObject({ id, qty: 1 });
  });

  it('moveToBag restores a saved line, merging into an existing bag line', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add({ ...baseLine, color: 'matte-black', size: 'm' }, 2));
    const id = result.current.lines[0].id;
    act(() => result.current.save(id)); // bag → saved (qty 1)
    act(() => result.current.add({ ...baseLine, color: 'matte-black', size: 'm' }, 4)); // re-add to bag
    act(() => result.current.moveToBag(id)); // saved (qty 1) → merges into bag line

    expect(result.current.saved).toEqual([]);
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].qty).toBe(5);
  });

  it('removeSaved drops a saved line without touching the bag', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(baseLine));
    const id = result.current.lines[0].id;
    act(() => result.current.save(id));
    act(() => result.current.removeSaved(id));

    expect(result.current.saved).toEqual([]);
    expect(result.current.lines).toEqual([]);
  });

  it('does not duplicate a saved line when the same id is saved twice', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(baseLine));
    const id = result.current.lines[0].id;
    act(() => result.current.save(id));
    act(() => result.current.add(baseLine)); // back in the bag
    act(() => result.current.save(id)); // save again

    expect(result.current.saved).toHaveLength(1);
  });

  it('persists saved lines under apex_saved and hydrates a new provider', () => {
    const first = renderHook(() => useCart(), { wrapper });
    act(() => first.result.current.add(baseLine));
    const id = first.result.current.lines[0].id;
    act(() => first.result.current.save(id));

    expect(JSON.parse(window.localStorage.getItem('apex_saved') ?? '[]')).toHaveLength(1);

    const second = renderHook(() => useCart(), { wrapper });
    expect(second.result.current.saved).toHaveLength(1);
  });

  it('falls back to an empty saved list when apex_saved is corrupt', () => {
    window.localStorage.setItem('apex_saved', '{bad json');

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.saved).toEqual([]);
  });

  it('save then moveToBag keeps quantity at 1 under StrictMode (no double-merge)', () => {
    const { result } = renderHook(() => useCart(), { wrapper: strictWrapper });

    act(() => result.current.add(baseLine, 2));
    const id = result.current.lines[0].id;

    act(() => result.current.save(id));
    expect(result.current.saved).toHaveLength(1);
    expect(result.current.saved[0].qty).toBe(1);

    act(() => result.current.moveToBag(id));
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].qty).toBe(1);
  });
});
