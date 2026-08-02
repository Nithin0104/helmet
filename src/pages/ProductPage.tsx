import { Navigate, useParams } from 'react-router-dom';
import { getProduct } from '../data/products';
import PageShell from './PageShell';

/**
 * Product detail page (PDP). Phase 3 routing scaffold — the image gallery,
 * colour/size selectors, add-to-cart flow, tabs, FAQs, reviews, and related
 * rail are built on top of this shell in the ProductPage step. Unknown ids
 * redirect home (the `getProduct` seam a real fetch replaces later).
 */
export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProduct(id) : undefined;

  if (!product) return <Navigate to="/" replace />;

  return <PageShell eyebrow={product.brand.toUpperCase()} title={product.name} />;
}
