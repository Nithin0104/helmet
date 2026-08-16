import type { ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import styles from './EmptyState.module.css';

export type EmptyStateVariant = 'dashed' | 'panel' | 'plain' | 'inset';
export type EmptyStateAlign = 'center' | 'left';
export type EmptyStateTone = 'neutral' | 'accent';

export interface EmptyStateProps {
  title: string;
  body?: string;
  /** Rich content in place of `body`. */
  children?: ReactNode;
  variant?: EmptyStateVariant;
  align?: EmptyStateAlign;
  /** Glyph color: muted (`neutral`, default) or the accent. */
  tone?: EmptyStateTone;
  showGlyph?: boolean;
  /** Emoji/text glyph. Ignored when `icon` is provided. */
  glyph?: string;
  /** Custom icon node, overrides `glyph`. */
  icon?: ReactNode;
  /** Small mono eyebrow above the title. */
  kicker?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
  className?: string;
}

/**
 * Empty / zero-results block: glyph + optional kicker, title, body and up to two
 * actions. Rendered as a polite `status` region so zero-result changes announce.
 */
export function EmptyState({
  title,
  body,
  children,
  variant = 'dashed',
  align = 'center',
  tone = 'neutral',
  showGlyph = true,
  glyph = '◫',
  icon,
  kicker,
  ctaLabel,
  onCtaClick,
  secondaryLabel,
  onSecondaryClick,
  className,
}: EmptyStateProps) {
  const hasBody = children != null || !!body;
  const hasActions = !!ctaLabel || !!secondaryLabel;

  return (
    <div role="status" className={cx(styles.root, className)}>
      <div className={cx(styles.box, styles[variant], styles[`align_${align}`])}>
        {showGlyph && (icon != null || glyph) && (
          <div aria-hidden className={cx(styles.glyph, styles[`tone_${tone}`])}>
            {icon ?? glyph}
          </div>
        )}
        {kicker && <div className={styles.kicker}>{kicker}</div>}
        <p className={styles.title}>{title}</p>
        {hasBody && <p className={styles.body}>{children ?? body}</p>}
        {hasActions && (
          <div className={styles.actions}>
            {ctaLabel && (
              <button type="button" className={styles.cta} onClick={onCtaClick}>
                {ctaLabel}
              </button>
            )}
            {secondaryLabel && (
              <button type="button" className={styles.secondary} onClick={onSecondaryClick}>
                {secondaryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
