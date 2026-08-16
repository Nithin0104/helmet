import { useEffect, useState } from 'react';

const STORAGE_KEY = 'apex_recently_viewed';

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* localStorage unavailable (private mode / quota) — recently-viewed is best-effort */
  }
}

/**
 * Persists the products a shopper has viewed (most-recent-first, in localStorage)
 * and returns the list for the "Recently viewed" rail. Pass the current product id
 * to record this visit; the returned list excludes it and is capped at `cap`.
 */
export function useRecentlyViewed(currentId?: string, cap = 8): string[] {
  const [ids, setIds] = useState<string[]>(read);

  useEffect(() => {
    if (!currentId) return;
    setIds((prev) => {
      const next = [currentId, ...prev.filter((id) => id !== currentId)].slice(0, cap + 1);
      write(next);
      return next;
    });
  }, [currentId, cap]);

  return ids.filter((id) => id !== currentId).slice(0, cap);
}
