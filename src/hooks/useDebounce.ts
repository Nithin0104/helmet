import { useEffect, useState } from 'react';

/**
 * Returns `value` only after it has stayed unchanged for `delay` ms. Used to keep
 * the price slider from writing to the URL on every drag frame.
 */
export function useDebounce<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
