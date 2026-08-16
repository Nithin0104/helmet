import { useEffect } from 'react';

const SUFFIX = 'APEXLINE';

/**
 * Sets the document `<title>` (and optionally the meta description) for the current
 * page, restoring the previous values on unmount. A tiny stand-in for a head manager
 * so each route has a distinct, SEO-friendly title instead of the app-wide default.
 */
export function useDocumentTitle(title: string, description?: string): void {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | ${SUFFIX}` : SUFFIX;

    let meta: HTMLMetaElement | null = null;
    let prevDescription: string | null = null;
    let created = false;
    if (description) {
      meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
        created = true;
      } else {
        prevDescription = meta.getAttribute('content');
      }
      meta.setAttribute('content', description);
    }

    return () => {
      document.title = prevTitle;
      if (meta) {
        if (created) meta.remove();
        else if (prevDescription != null) meta.setAttribute('content', prevDescription);
      }
    };
  }, [title, description]);
}
