import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { Icon } from '../Icon/Icon';
import styles from './Accordion.module.css';

export type AccordionMode = 'single' | 'multi';

export interface AccordionItem {
  id?: string;
  q: ReactNode;
  a: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  mode?: AccordionMode;
  speed?: number;
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({
  items,
  mode = 'single',
  speed = 0.28,
  defaultOpen = [],
  className,
}: AccordionProps) {
  const autoId = useId();
  const keyed = items.map((item, i) => ({ ...item, key: item.id ?? `${autoId}-${i}` }));
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (key: string) => {
    setOpen((prev) => {
      const next = new Set(mode === 'single' ? [] : prev);
      if (prev.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className={cx(styles.accordion, className)} style={{ '--speed': `${speed}s` } as React.CSSProperties}>
      {keyed.map(({ key, q, a }) => {
        const isOpen = open.has(key);
        return (
          <div key={key} className={cx(styles.item, isOpen && styles.open)}>
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={isOpen}
              onClick={() => toggle(key)}
            >
              <span className={styles.q}>{q}</span>
              <Icon icon={ChevronDown} size="sm" className={styles.chevron} />
            </button>
            <div className={styles.panelWrap}>
              <div className={styles.panel}>
                <div className={styles.panelInner}>{a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
