import type { CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'card' | 'block';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  lines?: number;
  lineHeight?: number | string;
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  radius?: number | string;
  className?: string;
}

function toDim(v: number | string | undefined): string | undefined {
  if (v == null) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

export function Skeleton({
  variant = 'text',
  lines = 3,
  lineHeight = 12,
  width,
  height,
  circle = false,
  radius,
  className,
}: SkeletonProps) {
  if (circle) {
    const d = toDim(width ?? height ?? 40);
    return (
      <span
        className={cx('shim', styles.circle, className)}
        style={{ width: d, height: d }}
        aria-hidden
      />
    );
  }

  if (variant === 'text') {
    return (
      <span className={cx(styles.textBlock, className)} aria-hidden>
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            className={cx('shim', styles.line)}
            style={{
              height: toDim(lineHeight),
              // last line is shorter, like real paragraph text
              width: i === lines - 1 ? '62%' : toDim(width) ?? '100%',
            }}
          />
        ))}
      </span>
    );
  }

  const style: CSSProperties = {
    width: toDim(width) ?? '100%',
    height: toDim(height) ?? (variant === 'card' ? 180 : 48),
    borderRadius: toDim(radius) ?? (variant === 'card' ? 'var(--radius-lg)' : 'var(--radius-md)'),
  };

  return <span className={cx('shim', styles.block, className)} style={style} aria-hidden />;
}
