import { SlidersHorizontal } from 'lucide-react';
import { Icon, Select, SegmentedToggle } from '../../../components/primitives';
import { SORT_OPTIONS } from '../../../data/filters';
import type { SortKey } from '../../../lib/catalog';
import type { UseProductFilters } from '../../../hooks/useProductFilters';
import styles from '../ShopPage.module.css';

export interface MobileFilterBarProps {
  plp: UseProductFilters;
  /** Mobile grid column count (1 or 2). */
  cols: number;
  onColsChange: (cols: number) => void;
  onOpenFilters: () => void;
}

const DENSITY_ITEMS = [
  { label: '1 column', value: '1', cols: 1, rows: 3 },
  { label: '2 columns', value: '2', cols: 2, rows: 2 },
];

/** Sticky filter/sort/density bar shown below 800px in place of the sidebar. */
export function MobileFilterBar({ plp, cols, onColsChange, onOpenFilters }: MobileFilterBarProps) {
  return (
    <div className={styles.mobileBar}>
      <button type="button" className={styles.filterBtn} onClick={onOpenFilters}>
        <Icon icon={SlidersHorizontal} size="sm" />
        Filters
        {plp.activeCount > 0 && <span className={styles.filterBadge}>{plp.activeCount}</span>}
      </button>
      <Select
        className={styles.mobileSort}
        variant="boxed"
        aria-label="Sort products"
        options={SORT_OPTIONS}
        value={plp.sort}
        onChange={(v) => plp.setSort(v as SortKey)}
      />
      <SegmentedToggle
        aria-label="Grid density"
        items={DENSITY_ITEMS}
        value={String(cols)}
        onChange={(v) => onColsChange(Number(v))}
      />
    </div>
  );
}
