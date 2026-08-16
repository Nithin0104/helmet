import { useRef, useState } from 'react';
import { cx } from '../../../lib/cx';
import { Modal } from '../../primitives/Modal/Modal';
import { HoverZoom } from '../../primitives/HoverZoom/HoverZoom';
import styles from './ProductGallery.module.css';

export interface ProductGalleryProps {
  /** View labels — an array, or a comma-separated string. */
  views: string[] | string;
  /** Frame background (a CSS background value, e.g. a repeating gradient / colour). */
  pattern?: string;
  /** Small colourway tag shown on each frame (e.g. "MATTE BLACK"). */
  tag?: string;
  /** Badge chip, top-left (e.g. "NEW"). */
  badge?: string;
  /** Safety chip, top-right (e.g. "SHARP 5★"). */
  safety?: string;
  /** Enable tap-to-expand fullscreen zoom. @default false */
  lightbox?: boolean;
  /** Controlled active index. */
  value?: number;
  /** Uncontrolled initial index. @default 0 */
  defaultValue?: number;
  onChange?: (index: number) => void;
  className?: string;
}

const DEFAULT_PATTERN = 'repeating-linear-gradient(135deg,#16161a 0 14px,#111114 14px 28px)';

function toViews(views: string[] | string): string[] {
  if (Array.isArray(views)) return views.length ? views : ['View'];
  return views.trim() ? views.split(',').map((s) => s.trim()) : ['View'];
}

/** A frame's placeholder tile (pattern + colourway tag + view label). */
function Frame({ label, tag, pattern }: { label: string; tag?: string; pattern: string }) {
  return (
    <div className={styles.frame} style={{ background: pattern }}>
      <div className={styles.shimmer} aria-hidden />
      <div className={styles.frameInner}>
        {tag && <div className={styles.tag}>{tag}</div>}
        <div className={styles.frameLabel}>[ {label} ]</div>
      </div>
    </div>
  );
}

/**
 * Product media viewer: a swipeable frame track with prev/next arrows, dots on
 * mobile and a thumbnail strip on desktop (swap at 800px), plus badge/safety/counter
 * overlays. Controlled or uncontrolled. With `lightbox`, tapping the frame opens a
 * fullscreen zoomable view. Renders placeholder tiles today; structured so real
 * `<img>` frames drop in unchanged.
 */
export function ProductGallery({
  views,
  pattern = DEFAULT_PATTERN,
  tag,
  badge,
  safety,
  lightbox = false,
  value,
  defaultValue = 0,
  onChange,
  className,
}: ProductGalleryProps) {
  const list = toViews(views);
  const count = list.length;
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const raw = isControlled ? (value as number) : internal;
  const i = Math.min(Math.max(0, raw), count - 1);
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = (next: number) => {
    const n = Math.max(0, Math.min(count - 1, next));
    if (n === i) return;
    if (!isControlled) setInternal(n);
    onChange?.(n);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(i + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(i - 1);
    }
  };

  return (
    <div className={cx(styles.root, className)}>
      <div
        className={styles.viewport}
        role="group"
        aria-label="Product images"
        onKeyDown={onKeyDown}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
        }}
      >
        {lightbox ? (
          <button
            type="button"
            className={styles.track}
            style={{ transform: `translateX(-${i * 100}%)` }}
            aria-label={`Expand image — ${list[i]}`}
            onClick={() => setZoomOpen(true)}
          >
            {list.map((label, k) => (
              <Frame key={`${label}-${k}`} label={label} tag={tag} pattern={pattern} />
            ))}
          </button>
        ) : (
          <div className={styles.track} style={{ transform: `translateX(-${i * 100}%)` }}>
            {list.map((label, k) => (
              <Frame key={`${label}-${k}`} label={label} tag={tag} pattern={pattern} />
            ))}
          </div>
        )}

        {badge && <span className={styles.badge}>{badge}</span>}
        {safety && <span className={styles.safety}>{safety}</span>}
        <span className={styles.counter} aria-live="polite">
          {i + 1} / {count}
        </span>

        <button
          type="button"
          className={cx(styles.arrow, styles.prev)}
          aria-label="Previous view"
          disabled={i === 0}
          onClick={() => go(i - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          className={cx(styles.arrow, styles.next)}
          aria-label="Next view"
          disabled={i === count - 1}
          onClick={() => go(i + 1)}
        >
          ›
        </button>
      </div>

      <div className={styles.dots}>
        {list.map((label, k) => (
          <button
            key={`dot-${k}`}
            type="button"
            className={cx(styles.dot, k === i && styles.dotOn)}
            aria-label={`Go to view ${k + 1}: ${label}`}
            aria-current={k === i}
            onClick={() => go(k)}
          />
        ))}
      </div>

      <div className={styles.thumbs}>
        {list.map((label, k) => (
          <button
            key={`thumb-${k}`}
            type="button"
            className={cx(styles.thumb, k === i && styles.thumbOn)}
            style={{ background: pattern }}
            aria-label={`View ${k + 1}: ${label}`}
            aria-current={k === i}
            onClick={() => go(k)}
          >
            <span className={styles.thumbLabel}>{label}</span>
          </button>
        ))}
      </div>

      {lightbox && (
        <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} size="lg" title="Product image">
          <HoverZoom
            mode="always"
            media={
              <div className={styles.zoomFrame} style={{ background: pattern }}>
                <div className={styles.frameInner}>
                  {tag && <div className={styles.tag}>{tag}</div>}
                  <div className={styles.frameLabel}>[ {list[i]} ]</div>
                </div>
              </div>
            }
          />
        </Modal>
      )}
    </div>
  );
}
