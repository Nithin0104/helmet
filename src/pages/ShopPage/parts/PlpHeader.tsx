import { useNavigate } from 'react-router-dom';
import { Breadcrumbs, Select, SegmentedToggle } from '../../../components/primitives';
import type { SortKey } from '../../../lib/catalog';
import type { PlpConfig } from '../../../data/plp';
import type { UseProductFilters } from '../../../hooks/useProductFilters';
import styles from '../ShopPage.module.css';

export interface PlpHeaderProps {
  plp: UseProductFilters;
  config: PlpConfig;
  /** Desktop grid column count (2 or 3). */
  cols: number;
  onColsChange: (cols: number) => void;
  isDesktop: boolean;
}

const DENSITY_ITEMS = [
  { label: '2 columns', value: '2', cols: 2, rows: 2 },
  { label: '3 columns', value: '3', cols: 3, rows: 2 },
];

/** Breadcrumbs + title, with the desktop-only sort + grid-density controls. */
export function PlpHeader({ plp, config, cols, onColsChange, isDesktop }: PlpHeaderProps) {
  const navigate = useNavigate();
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: config.breadcrumb },
        ]}
        onNavigate={(href) => navigate(href)}
      />
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{config.title}</h1>
          <p className={styles.subtitle}>{config.subtitle}</p>
        </div>
        {isDesktop && (
          <div className={styles.headControls}>
            <SegmentedToggle
              aria-label="Grid density"
              items={DENSITY_ITEMS}
              value={String(cols)}
              onChange={(v) => onColsChange(Number(v))}
            />
            <Select
              label="Sort:"
              aria-label="Sort products"
              options={config.sortOptions}
              value={plp.sort}
              onChange={(v) => plp.setSort(v as SortKey)}
            />
          </div>
        )}
      </div>
    </>
  );
}
