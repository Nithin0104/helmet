import { useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import styles from './HoverZoom.module.css';

export type HoverZoomMode = 'overlay' | 'always';

export interface HoverZoomProps {
  src?: string;
  media?: ReactNode;
  alt?: string;
  zoom?: number;
  mode?: HoverZoomMode;
  overlayContent?: ReactNode;
  className?: string;
}

export function HoverZoom({
  src,
  media,
  alt = '',
  zoom = 1.15,
  mode = 'overlay',
  overlayContent,
  className,
}: HoverZoomProps) {
  const [origin, setOrigin] = useState('50% 50%');
  const [active, setActive] = useState(mode === 'always');

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div
      className={cx(styles.wrap, className)}
      onMouseMove={mode === 'overlay' ? onMove : undefined}
      onMouseEnter={mode === 'overlay' ? () => setActive(true) : undefined}
      onMouseLeave={mode === 'overlay' ? () => setActive(false) : undefined}
    >
      <div
        className={cx(styles.media, active && styles.zoomed)}
        style={{ '--zoom': zoom, transformOrigin: origin } as CSSProperties}
      >
        {media ?? (src ? <img src={src} alt={alt} /> : <div className={styles.placeholder} aria-hidden />)}
      </div>
      {mode === 'overlay' && overlayContent && (
        <div className={cx(styles.overlay, active && styles.overlayVisible)}>{overlayContent}</div>
      )}
    </div>
  );
}
