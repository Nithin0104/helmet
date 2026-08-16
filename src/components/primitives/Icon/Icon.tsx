import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../../../lib/cx';
import styles from './Icon.module.css';

export type IconSize = 'sm' | 'md' | 'lg';

export interface IconProps {
  /** A Lucide icon component, e.g. `X`, `ChevronDown`, `Search`. */
  icon: LucideIcon;
  /**
   * Accessible name. When set the icon is exposed as `role="img"` with this
   * label; when omitted the icon is decorative (`aria-hidden`) — the default,
   * since icons usually sit next to visible text or inside a labelled button.
   */
  label?: string;
  /** Token size (`sm`=16, `md`=20, `lg`=24) or a raw px number. Default `md`. */
  size?: IconSize | number;
  /** SVG stroke width. Default `2`, matching the design system's line weight. */
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}

const SIZE_VAR: Record<IconSize, string> = {
  sm: 'var(--icon-sm)',
  md: 'var(--icon-md)',
  lg: 'var(--icon-lg)',
};

/**
 * Thin wrapper around a `lucide-react` icon. Sizes from the `--icon-*` tokens,
 * colors via `currentColor` (set `color` on the parent to tint — e.g.
 * `color: var(--accent)`), and handles decorative-vs-labelled a11y.
 */
export function Icon({
  icon: LucideComponent,
  label,
  size = 'md',
  strokeWidth = 2,
  className,
  style,
}: IconProps) {
  const sizeValue = typeof size === 'number' ? `${size}px` : SIZE_VAR[size];

  return (
    <LucideComponent
      className={cx(styles.icon, className)}
      strokeWidth={strokeWidth}
      style={{ '--icon-size': sizeValue, ...style } as CSSProperties}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable={false}
    />
  );
}
