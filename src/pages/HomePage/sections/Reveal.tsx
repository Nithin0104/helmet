import type { ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import { useReveal } from '../../../hooks/useReveal';

/** Wraps a home section so it fades/slides in when scrolled into view. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={cx('reveal', className)}>
      {children}
    </div>
  );
}
