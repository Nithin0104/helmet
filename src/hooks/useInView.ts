import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Tracks whether the referenced element is currently intersecting the viewport.
 * Unlike `useOffscreen` (which only fires once an element has scrolled *above*
 * the fold), this stays true whenever any part of the element is on screen —
 * used to hand the checkout CTA between the sticky summary card and the mobile
 * bar (show the bar only while the summary is out of view). Ports the DC
 * `watchSummary` IntersectionObserver.
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  threshold = 0.25,
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
    // threshold is a primitive read once on mount, matching useOffscreen/useReveal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, inView];
}
