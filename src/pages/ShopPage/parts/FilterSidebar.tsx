import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FilterGroup } from '../../../components/composite';
import { Icon, RangeSlider, Toggle } from '../../../components/primitives';
import { facetCounts } from '../../../lib/catalog';
import type { DerivedFacets } from '../../../lib/catalog';
import type { Product } from '../../../data/types';
import type { PlpConfig, PlpFilter } from '../../../data/plp';
import type { FilterKey } from '../../../data/filters';
import { cx } from '../../../lib/cx';
import { formatPrice } from '../../../lib/format';
import { useDebounce } from '../../../hooks/useDebounce';
import type { UseProductFilters } from '../../../hooks/useProductFilters';
import styles from '../ShopPage.module.css';

export interface FilterSidebarProps {
  plp: UseProductFilters;
  facets: DerivedFacets;
  products: Product[];
  /** The page config — supplies the ordered filter rail. */
  config: PlpConfig;
}

/**
 * The facet rail — rendered identically in the desktop sidebar and the mobile
 * sheet, driven entirely by `config.filters`. Each group is a collapsible
 * accordion; the first control is open, the rest start collapsed. Options and
 * live counts come from the derived facets + a single memoized `facetCounts`
 * sweep; all state is owned by the parent via `useProductFilters` (controlled).
 */
export function FilterSidebar({ plp, facets, products, config }: FilterSidebarProps) {
  // One count-aware sweep per filter change, not one pass per option per render.
  const counts = useMemo(() => facetCounts(products, plp.filters), [products, plp.filters]);

  return (
    <div className={styles.filterList}>
      {config.filters.map((filter, i) => (
        <Fragment key={filterKey(filter)}>
          {renderFilter(filter, i === 0)}
        </Fragment>
      ))}
    </div>
  );

  function renderFilter(filter: PlpFilter, open: boolean) {
    if (filter.kind === 'price') {
      return (
        <PriceFilter
          label={filter.label}
          plp={plp}
          min={facets.priceMin}
          max={facets.priceMax}
          defaultOpen={open}
        />
      );
    }
    if (filter.kind === 'stock') {
      return <StockToggle label={filter.label} plp={plp} />;
    }

    // facet
    const cfg = filter;
    const options = facets[cfg.id].map((o) => ({
      value: o.value,
      label: o.label,
      count: counts[cfg.id].get(o.value) ?? 0,
      ...('hex' in o ? { hex: o.hex } : {}),
    }));

    // Scope one facet's options to another's selection (e.g. brands in the chosen
    // categories). Values no longer reachable are hidden; the header shows a note.
    let shown = options;
    let titleNote: string | undefined;
    if (cfg.scopedBy) {
      const scopeSel = plp.filters[cfg.scopedBy];
      if (scopeSel.length > 0) {
        shown = options.filter((o) => o.count > 0 || plp.filters[cfg.id].includes(o.value));
        titleNote = scopeNote(cfg.scopedBy, scopeSel);
      }
    }

    return (
      <FilterGroup
        className={styles.group}
        title={cfg.label}
        titleNote={titleNote}
        variant={cfg.variant}
        searchable={cfg.searchable ?? false}
        collapsible
        defaultOpen={open}
        options={shown}
        value={plp.filters[cfg.id]}
        onChange={(vals) => plp.setFacet(cfg.id, vals)}
        searchPlaceholder={`Search ${cfg.label.toLowerCase()}`}
      />
    );
  }
}

function filterKey(filter: PlpFilter): string {
  return filter.kind === 'facet' ? `facet:${filter.id}` : filter.kind;
}

/** "IN GLOVES" for a single selection, else "IN 3 CATEGORIES". */
function scopeNote(scopeKey: FilterKey, selected: string[]): string {
  if (selected.length === 1) return `IN ${selected[0].toUpperCase()}`;
  return `IN ${selected.length} ${scopeKey === 'category' ? 'CATEGORIES' : `${scopeKey.toUpperCase()}S`}`;
}

interface PriceFilterProps {
  label: string;
  plp: UseProductFilters;
  min: number;
  max: number;
  defaultOpen: boolean;
}

function PriceFilter({ label, plp, min, max, defaultOpen }: PriceFilterProps) {
  const appliedLo = plp.filters.priceMin ?? min;
  const appliedHi = plp.filters.priceMax ?? max;
  const [range, setRange] = useState<[number, number]>([appliedLo, appliedHi]);
  const [open, setOpen] = useState(defaultOpen);

  // Follow external changes (clear-all, chip removal).
  useEffect(() => {
    setRange([plp.filters.priceMin ?? min, plp.filters.priceMax ?? max]);
  }, [plp.filters.priceMin, plp.filters.priceMax, min, max]);

  // Debounce drag → URL so we don't write a history entry per frame.
  const debounced = useDebounce(range, 250);
  useEffect(() => {
    const [lo, hi] = debounced;
    if (lo !== (plp.filters.priceMin ?? min) || hi !== (plp.filters.priceMax ?? max)) {
      plp.setPriceRange(lo <= min ? null : lo, hi >= max ? null : hi);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.collapHead}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.collapTitle}>{label}</span>
        <Icon icon={ChevronDown} size="sm" className={cx(styles.collapChev, !open && styles.collapChevClosed)} />
      </button>
      {open && (
        <>
          <div className={styles.priceRow}>
            <span>{formatPrice(range[0])}</span>
            <span className={styles.priceMax}>{formatPrice(range[1])}</span>
          </div>
          <RangeSlider
            min={min}
            max={max}
            step={500}
            value={range}
            onChange={(v) => setRange(v as [number, number])}
            showValue={false}
          />
        </>
      )}
    </div>
  );
}

function StockToggle({ label, plp }: { label: string; plp: UseProductFilters }) {
  return (
    <div className={styles.group}>
      <Toggle
        className={styles.stockToggle}
        label={label}
        checked={plp.filters.inStock}
        onChange={() => plp.toggleInStock()}
      />
    </div>
  );
}
