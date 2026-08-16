import { BottomSheet } from '../../../components/primitives';
import type { DerivedFacets } from '../../../lib/catalog';
import type { Product } from '../../../data/types';
import type { PlpConfig } from '../../../data/plp';
import type { UseProductFilters } from '../../../hooks/useProductFilters';
import { FilterSidebar } from './FilterSidebar';
import styles from '../ShopPage.module.css';

export interface FilterSheetProps {
  plp: UseProductFilters;
  facets: DerivedFacets;
  products: Product[];
  config: PlpConfig;
  open: boolean;
  /** Result count shown on the apply button. */
  total: number;
  onClose: () => void;
}

/** Mobile filter drawer: the shared facet rail in a BottomSheet with apply/clear. */
export function FilterSheet({ plp, facets, products, config, open, total, onClose }: FilterSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Filters" snapPoints={[82]}>
      <FilterSidebar plp={plp} facets={facets} products={products} config={config} />
      <div className={styles.sheetFooter}>
        <button type="button" className={styles.sheetClear} onClick={plp.clearAll}>
          Clear all
        </button>
        <button type="button" className={styles.sheetApply} onClick={onClose}>
          Show {total} {total === 1 ? 'result' : 'results'}
        </button>
      </div>
    </BottomSheet>
  );
}
