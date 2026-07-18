import { useState } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Pagination.module.css';

export type PaginationVariant = 'numbers' | 'dots';

export interface PaginationProps {
  total: number;
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
  variant?: PaginationVariant;
  speed?: number;
  siblingCount?: number;
  showPrevNext?: boolean;
  className?: string;
}

const DOTS = 'dots' as const;

function buildRange(current: number, total: number, siblingCount: number): Array<number | typeof DOTS> {
  const totalNumbers = siblingCount * 2 + 5;
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftIndex = Math.max(current - siblingCount, 1);
  const rightIndex = Math.min(current + siblingCount, total);

  const showLeftDots = leftIndex > 2;
  const showRightDots = rightIndex < total - 1;

  const range: Array<number | typeof DOTS> = [1];

  if (showLeftDots) range.push(DOTS);
  for (let i = Math.max(leftIndex, 2); i <= Math.min(rightIndex, total - 1); i++) {
    range.push(i);
  }
  if (showRightDots) range.push(DOTS);

  range.push(total);
  return range;
}

export function Pagination({
  total,
  page,
  defaultPage = 1,
  onChange,
  variant = 'numbers',
  speed = 0.18,
  siblingCount = 1,
  showPrevNext = true,
  className,
}: PaginationProps) {
  const [internal, setInternal] = useState(defaultPage);
  const isControlled = page !== undefined;
  const current = isControlled ? page : internal;

  const go = (p: number) => {
    const clamped = Math.min(total, Math.max(1, p));
    if (!isControlled) setInternal(clamped);
    onChange?.(clamped);
  };

  if (variant === 'dots') {
    return (
      <nav className={cx(styles.nav, className)} aria-label="Pagination" style={{ '--speed': `${speed}s` } as React.CSSProperties}>
        <div className={styles.dotRow}>
          {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={cx(styles.dot, p === current && styles.dotActive)}
              aria-label={`Go to page ${p}`}
              aria-current={p === current ? 'page' : undefined}
              onClick={() => go(p)}
            />
          ))}
        </div>
      </nav>
    );
  }

  const pages = buildRange(current, total, siblingCount);

  return (
    <nav className={cx(styles.nav, className)} aria-label="Pagination" style={{ '--speed': `${speed}s` } as React.CSSProperties}>
      <div className={styles.row}>
        {showPrevNext && (
          <button
            type="button"
            className={styles.arrow}
            disabled={current === 1}
            aria-label="Previous page"
            onClick={() => go(current - 1)}
          >
            ‹
          </button>
        )}
        {pages.map((p, i) =>
          p === DOTS ? (
            <span key={`dots-${i}`} className={styles.ellipsis}>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={cx(styles.page, p === current && styles.pageActive)}
              aria-current={p === current ? 'page' : undefined}
              onClick={() => go(p)}
            >
              {p}
            </button>
          ),
        )}
        {showPrevNext && (
          <button
            type="button"
            className={styles.arrow}
            disabled={current === total}
            aria-label="Next page"
            onClick={() => go(current + 1)}
          >
            ›
          </button>
        )}
      </div>
    </nav>
  );
}
