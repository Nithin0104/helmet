/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY = 'apex_cart';
const SAVED_KEY = 'apex_saved';

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
  /** Lines parked for later — persisted separately, survive an emptied bag. */
  saved: CartLine[];
  /** Move a bag line to "saved for later" (quantity resets to 1). */
  save: (id: string) => void;
  /** Move a saved line back into the bag (merges into an existing line). */
  moveToBag: (id: string) => void;
  /** Drop a saved line entirely. */
  removeSaved: (id: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function lineId(line: Pick<CartLineInput, 'productId' | 'color' | 'size'>): string {
  return [line.productId, line.color ?? '', line.size ?? ''].join('|');
}

function readStoredLines(key: string): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

/** Merge a line into a list by id, adding quantities when it already exists. */
function mergeLine(list: CartLine[], line: CartLine): CartLine[] {
  const existing = list.find((l) => l.id === line.id);
  if (existing) {
    return list.map((l) => (l.id === line.id ? { ...l, qty: l.qty + line.qty } : l));
  }
  return [...list, line];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readStoredLines(STORAGE_KEY));
  const [saved, setSaved] = useState<CartLine[]>(() => readStoredLines(SAVED_KEY));

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  useEffect(() => {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved]);

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

  // Bag ⇄ saved moves capture the line from the current render, then update each
  // list with its own pure updater. Nesting one setState inside another's updater
  // is an impure updater that React StrictMode double-invokes, which would merge
  // the moved line twice (doubling its quantity).
  const save = (id: string) => {
    const line = lines.find((l) => l.id === id);
    if (!line) return;
    setLines((prev) => prev.filter((l) => l.id !== id));
    setSaved((prev) => (prev.some((x) => x.id === id) ? prev : [...prev, { ...line, qty: 1 }]));
  };

  const moveToBag = (id: string) => {
    const line = saved.find((l) => l.id === id);
    if (!line) return;
    setSaved((prev) => prev.filter((l) => l.id !== id));
    setLines((prev) => mergeLine(prev, line));
  };

  const removeSaved = (id: string) => {
    setSaved((prev) => prev.filter((l) => l.id !== id));
  };

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.qty * l.price, 0), [lines]);

  return (
    <CartContext.Provider
      value={{ lines, count, subtotal, add, setQty, remove, clear, saved, save, moveToBag, removeSaved }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
