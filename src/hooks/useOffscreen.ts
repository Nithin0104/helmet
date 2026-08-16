import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Tracks whether the referenced element has scrolled up and out of the viewport
 * (its top edge is above the fold and it's no longer intersecting). Drives the
 * PDP's sticky buy bar — it appears once the main add-to-cart CTA scrolls off.
 * Mirrors the DC `watchCta` IntersectionObserver logic.
 */
export function useOffscreen<T extends HTMLElement = HTMLElement>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const above = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setOffscreen(above);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, offscreen];
}
