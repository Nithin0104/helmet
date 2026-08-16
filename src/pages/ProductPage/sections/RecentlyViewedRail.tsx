import { ProductRail } from '../../../components/composite';
import type { Product } from '../../../data/types';

/** "Recently viewed" rail — the shopper's own trail of PDPs (localStorage-backed). */
export function RecentlyViewedRail({ items }: { items: Product[] }) {
  if (!items.length) return null;
  return (
    <ProductRail
      title="Recently viewed"
      items={items}
      layout="shelf"
      sectionId="pdp-recent"
      limit={8}
    />
  );
}
