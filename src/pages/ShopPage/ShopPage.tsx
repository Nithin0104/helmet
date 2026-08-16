import { useMemo, useState } from 'react';
import { deriveFacets, filterProducts, sortProducts, paginate } from '../../lib/catalog';
import { PAGE_SIZE, PAGE_SIZE_MOBILE } from '../../data/filters';
import { PLP_CONFIGS, facetConfigsOf } from '../../data/plp';
import type { PlpConfig } from '../../data/plp';
import { useProductFilters } from '../../hooks/useProductFilters';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PlpHeader } from './parts/PlpHeader';
import { FilterSidebar } from './parts/FilterSidebar';
import { MobileFilterBar } from './parts/MobileFilterBar';
import { FilterSheet } from './parts/FilterSheet';
import { AppliedChips } from './parts/AppliedChips';
import { ResultsGrid } from './parts/ResultsGrid';
import styles from './ShopPage.module.css';

export interface ShopPageProps {
  /** Which category PLP to render. Defaults to Helmets so `/shop` still works. */
  config?: PlpConfig;
}

/**
 * Product listing page — the DC "PLP Responsive" design ported onto real data and
 * generalised to any catalog via a `PlpConfig` (see `src/data/plp.ts`). Copy,
 * dataset and the filter rail all come from the config; filter/sort/pagination
 * state lives in the URL (via `useProductFilters`). Below 800px the desktop sidebar
 * is swapped for a mobile filter sheet.
 */
export default function ShopPage({ config = PLP_CONFIGS.helmets }: ShopPageProps) {
  useDocumentTitle(config.title, config.metaDescription);

  const products = config.products;
  const facetConfigs = useMemo(() => facetConfigsOf(config), [config]);
  const facets = useMemo(() => deriveFacets(products), [products]);

  const isDesktop = useIsDesktop();
  const plp = useProductFilters(facets, facetConfigs);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [desktopCols, setDesktopCols] = useState(3);
  const [mobileCols, setMobileCols] = useState(2);

  const cols = isDesktop ? desktopCols : mobileCols;
  const pageSize = isDesktop ? PAGE_SIZE : PAGE_SIZE_MOBILE;

  const pageResult = useMemo(() => {
    const filtered = filterProducts(products, plp.filters);
    const sorted = sortProducts(filtered, plp.sort);
    return paginate(sorted, plp.page, pageSize);
  }, [products, plp.filters, plp.sort, plp.page, pageSize]);

  const countLabel =
    pageResult.total === 0
      ? `No ${config.countNoun} match your filters`
      : `Showing ${pageResult.start}–${pageResult.end} of ${pageResult.total} ${config.countNoun}`;

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />

      {!isDesktop && (
        <MobileFilterBar
          plp={plp}
          cols={mobileCols}
          onColsChange={setMobileCols}
          onOpenFilters={() => setSheetOpen(true)}
        />
      )}

      <div className={styles.container}>
        <PlpHeader
          plp={plp}
          config={config}
          cols={desktopCols}
          onColsChange={setDesktopCols}
          isDesktop={isDesktop}
        />
        <AppliedChips plp={plp} countLabel={countLabel} />

        <div className={styles.body}>
          {isDesktop && (
            <aside className={styles.sidebar}>
              <FilterSidebar plp={plp} facets={facets} products={products} config={config} />
            </aside>
          )}
          <div className={styles.main}>
            <ResultsGrid
              plp={plp}
              config={config}
              items={pageResult.items}
              pageResult={pageResult}
              cols={cols}
              isDesktop={isDesktop}
            />
          </div>
        </div>
      </div>

      {!isDesktop && (
        <FilterSheet
          plp={plp}
          facets={facets}
          products={products}
          config={config}
          open={sheetOpen}
          total={pageResult.total}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}
