import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets window scroll to the top whenever the route (pathname) changes.
 *
 * React Router's `<Routes>` (a non-data router) preserves the previous page's
 * scroll offset across navigations, which drops the user into the middle of a
 * fresh page. This restores the expected "new page starts at the top" behavior.
 *
 * Navigations that only change the hash are left alone so in-page anchor links
 * (e.g. `/product/1#reviews`) still scroll to their target. Runs in a layout
 * effect to reset before paint and avoid a visible jump.
 */
export function useScrollToTop(): void {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
}
