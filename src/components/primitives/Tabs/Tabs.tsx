import { useId, useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import styles from './Tabs.module.css';

export type TabsVariant = 'underline' | 'pill' | 'segment';
export type TabsSize = 'sm' | 'md';

export interface TabItem {
  id: string;
  label: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  variant?: TabsVariant;
  speed?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  fullWidth?: boolean;
  size?: TabsSize;
  className?: string;
}

export function Tabs({
  items,
  variant = 'underline',
  speed = 0.22,
  value,
  defaultValue,
  onChange,
  fullWidth = false,
  size = 'md',
  className,
}: TabsProps) {
  const autoId = useId();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const isControlled = value !== undefined;
  const active = isControlled ? value : internal;

  const select = (id: string) => {
    if (!isControlled) setInternal(id);
    onChange?.(id);
  };

  const activeItem = items.find((it) => it.id === active);

  return (
    <div className={cx(styles.wrap, className)} style={{ '--speed': `${speed}s` } as CSSProperties}>
      <div
        className={cx(styles.list, styles[variant], styles[size], fullWidth && styles.fullWidth)}
        role="tablist"
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${autoId}-tab-${item.id}`}
            aria-selected={active === item.id}
            aria-controls={`${autoId}-panel-${item.id}`}
            disabled={item.disabled}
            className={cx(styles.tab, active === item.id && styles.active)}
            onClick={() => select(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {activeItem?.content != null && (
        <div
          className={styles.panel}
          role="tabpanel"
          id={`${autoId}-panel-${activeItem.id}`}
          aria-labelledby={`${autoId}-tab-${activeItem.id}`}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
