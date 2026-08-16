import { AppliedFilterBar } from '../../../components/composite';
import type { UseProductFilters } from '../../../hooks/useProductFilters';
import styles from '../ShopPage.module.css';

export interface AppliedChipsProps {
  plp: UseProductFilters;
  /** e.g. "Showing 1–9 of 24 helmets". */
  countLabel: string;
}

/** Result count + removable filter chips + clear-all, driven by parent state. */
export function AppliedChips({ plp, countLabel }: AppliedChipsProps) {
  return (
    <AppliedFilterBar
      className={styles.chips}
      chips={plp.activeChips}
      variant="inline"
      showGroups
      countLabel={countLabel}
      emptyLabel=""
      onRemove={plp.removeChip}
      onClearAll={plp.clearAll}
    />
  );
}
