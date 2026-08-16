import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../Icon/Icon';
import styles from './Carousel.module.css';

export interface CarouselProps {
  items?: ReactNode[];
  children?: ReactNode[];
  autoplay?: boolean;
  interval?: number;
  speed?: number;
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  index?: number;
  onChange?: (index: number) => void;
  pauseOnHover?: boolean;
  className?: string;
}

export function Carousel({
  items,
  children,
  autoplay = false,
  interval = 4000,
  speed = 0.4,
  loop = true,
  showArrows = true,
  showDots = true,
  index,
  onChange,
  pauseOnHover = true,
  className,
}: CarouselProps) {
  const slides = items ?? children ?? [];
  const [internal, setInternal] = useState(0);
  const [hovering, setHovering] = useState(false);
  const isControlled = index !== undefined;
  const current = isControlled ? index : internal;

  const goTo = (i: number) => {
    const count = slides.length;
    const next = loop ? (i + count) % count : Math.min(count - 1, Math.max(0, i));
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  useEffect(() => {
    if (!autoplay || slides.length <= 1 || (pauseOnHover && hovering)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => goTo(current + 1), interval);
    return () => clearInterval(t);
  }, [autoplay, interval, current, hovering, pauseOnHover, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className={cx(styles.carousel, className)}
      style={{ '--speed': `${speed}s` } as React.CSSProperties}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className={styles.viewport}>
        <div className={styles.track} style={{ transform: `translateX(-${current * 100}%)` }}>
          {slides.map((slide, i) => (
            <div className={styles.slide} key={i} aria-hidden={i !== current}>
              {slide}
            </div>
          ))}
        </div>
      </div>

      {showArrows && slides.length > 1 && (
        <>
          <button
            type="button"
            className={cx(styles.arrow, styles.prev)}
            aria-label="Previous slide"
            disabled={!loop && current === 0}
            onClick={() => goTo(current - 1)}
          >
            <Icon icon={ChevronLeft} />
          </button>
          <button
            type="button"
            className={cx(styles.arrow, styles.next)}
            aria-label="Next slide"
            disabled={!loop && current === slides.length - 1}
            onClick={() => goTo(current + 1)}
          >
            <Icon icon={ChevronRight} />
          </button>
        </>
      )}

      {showDots && slides.length > 1 && (
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={cx(styles.dot, i === current && styles.dotActive)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
