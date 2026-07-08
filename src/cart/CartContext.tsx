/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY = 'apex_cart';

export interface CartLine {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  color?: string;
  size?: string;
  qty: number;
}

export type CartLineInput = Omit<CartLine, 'id' | 'qty'>;

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: CartLineInput, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function lineId(line: Pick<CartLineInput, 'productId' | 'color' | 'size'>): string {
  return [line.productId, line.color ?? '', line.size ?? ''].join('|');
}

function readStoredLines(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStoredLines);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const add = (line: CartLineInput, qty = 1) => {
    const id = lineId(line);
    setLines((prev) => {
      const existing = prev.find((l) => l.id === id);
      if (existing) {
        return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { ...line, id, qty }];
    });
  };

  const setQty = (id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  };

  const remove = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const clear = () => setLines([]);

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.qty * l.price, 0), [lines]);

  return (
    <CartContext.Provider value={{ lines, count, subtotal, add, setQty, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
