import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../../../components/composite';
import { EmptyState, PromoTile, Pagination, Skeleton } from '../../../components/primitives';
import { isInStock } from '../../../lib/catalog';
import type { PageResult } from '../../../lib/catalog';
import type { Product } from '../../../data/types';
import { PROMO_INDEX, PROMO_INDEX_MOBILE } from '../../../data/filters';
import type { PlpConfig } from '../../../data/plp';
import type { UseProductFilters } from '../../../hooks/useProductFilters';
import styles from '../ShopPage.module.css';

export interface ResultsGridProps {
  plp: UseProductFilters;
  config: PlpConfig;
  items: Product[];
  pageResult: PageResult<Product>;
  cols: number;
  isDesktop: boolean;
  /**
   * Render a skeleton grid instead of results. Wired for when the catalog becomes
   * an async fetch — the page never assumes data is present before first paint.
   */
  loading?: boolean;
}

/** The product grid: cards + an in-grid promo, or a zero-results empty state, plus the pager. */
export function ResultsGrid({ plp, config, items, pageResult, cols, isDesktop, loading = false }: ResultsGridProps) {
  const navigate = useNavigate();
  const gridStyle = { '--plp-cols': cols } as CSSProperties;

  if (loading) {
    return (
      <div
        className={styles.grid}
        style={gridStyle}
        aria-busy="true"
        aria-label={`Loading ${config.countNoun}`}
      >
        {Array.from({ length: cols * 3 }, (_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (pageResult.total === 0) {
    return (
      <EmptyState
        variant="dashed"
        title={`No ${config.countNoun} match`}
        body="Try widening your price range or clearing a filter to see more."
        ctaLabel="Clear all filters"
        onCtaClick={plp.clearAll}
      />
    );
  }

  const promo = config.promo;
  const promoIndex = isDesktop ? PROMO_INDEX : PROMO_INDEX_MOBILE;
  const showPromo = !!promo && pageResult.page === 1 && items.length >= promoIndex;

  const cells = items.map((p) => (
    <ProductCard
      key={p.id}
      product={p}
      grow
      heart
      quickAdd
      showCertification
      headingLevel={2}
      soldOut={!isInStock(p)}
    />
  ));
  if (showPromo && promo) {
    cells.splice(
      promoIndex,
      0,
      <PromoTile
        key="promo"
        className={styles.promo}
        variant="gradient"
        layout="stack"
        kicker={promo.kicker}
        headline={promo.headline}
        ctaLabel={promo.ctaLabel}
        onCtaClick={() => navigate(promo.ctaHref)}
      />,
    );
  }

  const changePage = (pg: number) => {
    plp.setPage(pg);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className={styles.grid} style={gridStyle}>
        {cells}
      </div>
      {pageResult.pageCount > 1 && (
        <Pagination
          className={styles.pager}
          total={pageResult.pageCount}
          page={pageResult.page}
          onChange={changePage}
        />
      )}
    </>
  );
}
