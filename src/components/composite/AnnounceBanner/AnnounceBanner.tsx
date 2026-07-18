import { Marquee } from '../../primitives';
import { cx } from '../../../lib/cx';
import styles from './AnnounceBanner.module.css';

export interface AnnounceBannerProps {
  /** Promo lines scrolled across the strip. */
  messages: string[];
  /** Seconds for one full loop (lower = faster). Default 22 (the DC value). */
  speed?: number;
  /** Pause the scroll on hover (default true). */
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * The accent promo strip at the very top of the shell. A thin wrapper over the
 * Phase 1 `Marquee` `solid` variant (which is the DC announce bar), tuned to the
 * banner's compact type scale.
 */
export function AnnounceBanner({
  messages,
  speed = 22,
  pauseOnHover = true,
  className,
}: AnnounceBannerProps) {
  return (
    <Marquee
      variant="solid"
      items={messages}
      speed={speed}
      pauseOnHover={pauseOnHover}
      className={cx(styles.banner, className)}
    />
  );
}
