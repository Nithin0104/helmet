import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../Icon/Icon';
import styles from './PromoTile.module.css';

export type PromoTileVariant = 'gradient' | 'solid' | 'outline' | 'dark' | 'hatch';
export type PromoTileLayout = 'row' | 'stack';

export interface PromoTileProps {
  headline: string;
  kicker?: string;
  sub?: string;
  /** Extra content in place of `sub`. */
  children?: ReactNode;
  variant?: PromoTileVariant;
  layout?: PromoTileLayout;
  ctaLabel?: string;
  /** Renders the CTA as a link. Takes precedence over `onCtaClick`. */
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
}

/** Promotional banner tile: kicker + headline + optional sub, with a CTA. */
export function PromoTile({
  headline,
  kicker,
  sub,
  children,
  variant = 'gradient',
  layout = 'row',
  ctaLabel,
  ctaHref,
  onCtaClick,
  className,
}: PromoTileProps) {
  const onColor = variant === 'gradient' || variant === 'solid';
  const hasCta = !!ctaLabel;
  const ctaContent = ctaLabel ? (
    <>
      {ctaLabel} <Icon icon={ArrowRight} size="sm" />
    </>
  ) : null;

  return (
    <div
      className={cx(
        styles.tile,
        styles[variant],
        styles[`layout_${layout}`],
        onColor && styles.onColor,
        className,
      )}
    >
      <div className={styles.copy}>
        {kicker && <div className={styles.kicker}>{kicker}</div>}
        <div className={styles.headline}>{headline}</div>
        {(children != null || sub) && <p className={styles.sub}>{children ?? sub}</p>}
      </div>
      {hasCta &&
        (ctaHref ? (
          <a href={ctaHref} className={styles.cta}>
            {ctaContent}
          </a>
        ) : (
          <button type="button" className={styles.cta} onClick={onCtaClick}>
            {ctaContent}
          </button>
        ))}
    </div>
  );
}
