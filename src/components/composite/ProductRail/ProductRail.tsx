import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../../../lib/cx';
import { useDragScroll } from '../../../hooks/useDragScroll';
import { ProductCard } from '../ProductCard/ProductCard';
import { Skeleton } from '../../primitives';
import type { Product } from '../../../data/types';
import styles from './ProductRail.module.css';

export interface RailTab {
  id: string;
  label: string;
  items: Product[];
}

export interface ProductRailProps {
  title: string;
  /** Segmented control (e.g. Bestsellers / New Arrivals). Omit for a single list. */
  tabs?: RailTab[];
  /** Products to show when `tabs` isn't provided. */
  items?: Product[];
  /** `shelf` = horizontal drag-scroll rail; `grid` = responsive wrapping grid. */
  layout?: 'shelf' | 'grid';
  seeAllHref?: string;
  seeAllLabel?: string;
  /** id for the <section>, used as an anchor target and to label the heading. */
  sectionId?: string;
  /** Controlled active tab id. Omit for uncontrolled (internal state). */
  activeTabId?: string;
  /** Fired with the selected tab id on change (works controlled or uncontrolled). */
  onTabChange?: (id: string) => void;
  /** Show placeholder skeleton cards instead of content (async loading). */
  loading?: boolean;
  /** How many skeleton cards to show while `loading`. Default 4. */
  skeletonCount?: number;
  className?: string;
}

/**
 * A titled product rail: heading + optional "SEE ALL" link, an optional
 * Bestsellers/New-Arrivals segmented control, and a track of `ProductCard`s that
 * either drag-scrolls horizontally (`shelf`) or wraps in a grid (`grid`).
 */
export function ProductRail({
  title,
  tabs,
  items = [],
  layout = 'shelf',
  seeAllHref,
  seeAllLabel = 'SEE ALL →',
  sectionId,
  activeTabId,
  onTabChange,
  loading = false,
  skeletonCount = 4,
  className,
}: ProductRailProps) {
  const [internalActive, setInternalActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const track = useDragScroll<HTMLDivElement>();

  // Controlled when an activeTabId is supplied (with tabs); else internal state.
  const isControlled = activeTabId !== undefined && !!tabs;
  const active = isControlled ? Math.max(0, tabs!.findIndex((t) => t.id === activeTabId)) : internalActive;

  const selectTab = (i: number) => {
    if (!tabs) return;
    if (!isControlled) setInternalActive(i);
    onTabChange?.(tabs[i].id);
  };

  const current = tabs ? (tabs[active]?.items ?? []) : items;
  const isShelf = layout === 'shelf';
  const base = sectionId ?? title.toLowerCase().replace(/\s+/g, '-');
  const titleId = `${base}-title`;
  const trackClass = cx(styles.track, isShelf ? styles.shelf : styles.grid, styles.swap);

  const onTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!tabs) return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = (active + dir + tabs.length) % tabs.length;
    selectTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id={sectionId} className={cx(styles.rail, className)} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {seeAllHref && (
          <Link to={seeAllHref} className={styles.seeAll}>
            {seeAllLabel}
          </Link>
        )}
      </div>

      {tabs && (
        <div className={styles.tabs} role="tablist" aria-label={title} onKeyDown={onTabKeyDown}>
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${tab.id}`}
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              className={cx(styles.tab, i === active && styles.tabActive)}
              onClick={() => selectTab(i)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className={trackClass} role="status" aria-busy="true" aria-label={`Loading ${title}`}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <Skeleton
              key={i}
              variant="card"
              height={290}
              radius={0}
              width={isShelf ? 168 : undefined}
            />
          ))}
        </div>
      ) : current.length === 0 ? (
        <p className={styles.empty}>Nothing here yet — check back soon.</p>
      ) : (
        <div
          key={tabs ? tabs[active]?.id : 'items'}
          ref={isShelf ? track : undefined}
          className={trackClass}
          role={tabs ? 'tabpanel' : undefined}
          aria-label={tabs ? tabs[active]?.label : undefined}
          tabIndex={isShelf ? 0 : undefined}
        >
          {current.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              heart
              quickAdd
              fixedWidth={isShelf}
              grow={!isShelf}
            />
          ))}
        </div>
      )}
    </section>
  );
}
