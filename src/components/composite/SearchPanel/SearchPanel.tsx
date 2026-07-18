import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { cx } from '../../../lib/cx';
import { formatPrice } from '../../../lib/format';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { PRODUCTS } from '../../../data/products';
import { TRENDING } from '../../../data/navigation';
import type { Product } from '../../../data/types';
import styles from './SearchPanel.module.css';

export interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
  /** Trending terms shown when the query is empty. */
  trending?: string[];
  className?: string;
}

function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((p) =>
    `${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(q),
  ).slice(0, 6);
}

/** Overlay search: live catalog results plus trending terms when empty. */
export function SearchPanel({ open, onClose, trending = TRENDING, className }: SearchPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  useFocusTrap(ref, open, { onEscape: handleClose });

  function handleClose() {
    setQuery('');
    onClose();
  }

  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const results = searchProducts(query);

  return createPortal(
    <div className={cx(styles.root, className)}>
      <div className={styles.scrim} onClick={handleClose} />
      <div ref={ref} className={styles.panel} role="dialog" aria-modal="true" aria-label="Search">
        <div className={styles.inner}>
          <div className={styles.searchRow}>
            <span className={styles.searchIcon} aria-hidden>
              ⌕
            </span>
            <input
              className={styles.input}
              type="search"
              value={query}
              placeholder="Search helmets, brands, gear…"
              aria-label="Search helmets, brands, gear"
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className={styles.cancel} onClick={handleClose}>
              CANCEL
            </button>
          </div>

          {hasQuery ? (
            results.length === 0 ? (
              <div className={styles.empty}>No results for “{query}”</div>
            ) : (
              <div className={styles.results}>
                {results.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    onClick={handleClose}
                    className={styles.result}
                  >
                    <div className={styles.thumb}>
                      <span className={styles.thumbTag}>[ {p.category.toUpperCase()} ]</span>
                    </div>
                    <div className={styles.resultBody}>
                      <div className={styles.resultMeta}>
                        {p.brand} · {p.category}
                      </div>
                      <div className={styles.resultName}>{p.name}</div>
                    </div>
                    <div className={styles.resultPrice}>{formatPrice(p.price)}</div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className={styles.trending}>
              <div className={styles.trendingHead}>TRENDING SEARCHES</div>
              <div className={styles.chips}>
                {trending.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className={styles.chip}
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
