import { useEffect, useRef, useState } from 'react';
import { cx } from '../../../lib/cx';
import styles from './CountUp.module.css';

export type CountUpEasing = 'linear' | 'easeOut';

export interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  easing?: CountUpEasing;
  startOnView?: boolean;
  className?: string;
}

const EASINGS: Record<CountUpEasing, (t: number) => number> = {
  linear: (t) => t,
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
};

export function CountUp({
  value,
  duration = 1500,
  prefix = '',
  suffix = '',
  decimals = 0,
  easing = 'easeOut',
  startOnView = true,
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [armed, setArmed] = useState(!startOnView);

  useEffect(() => {
    if (armed || !startOnView) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setArmed(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [armed, startOnView]);

  useEffect(() => {
    if (!armed) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || duration <= 0) {
      setDisplay(value);
      return;
    }
    const ease = EASINGS[easing];
    let raf = 0;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      setDisplay(value * ease(t));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [armed, value, duration, easing]);

  const formatted = display.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={cx(styles.count, className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
