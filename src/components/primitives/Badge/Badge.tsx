import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Badge.module.css';

export type BadgeVariant = 'soft' | 'solid' | 'outline' | 'dot';
export type BadgeTone = 'accent' | 'success' | 'danger' | 'gold' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: BadgeSize;
  label?: string;
  children?: ReactNode;
  icon?: ReactNode;
  pulse?: boolean;
}

export function Badge({
  variant = 'soft',
  tone = 'accent',
  size = 'md',
  label,
  children,
  icon,
  pulse = false,
  className,
  ...rest
}: BadgeProps) {
  const content = children ?? label;

  return (
    <span
      className={cx(styles.badge, styles[variant], styles[tone], styles[size], className)}
      {...rest}
    >
      {variant === 'dot' && <span className={cx(styles.dot, pulse && styles.pulse)} />}
      {icon && variant !== 'dot' && <span className={styles.icon}>{icon}</span>}
      {content != null && <span>{content}</span>}
    </span>
  );
}
