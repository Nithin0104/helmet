import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../components/primitives';
import {
  ProductGallery,
  StickyBuyBar,
  SizeGuideSheet,
  CartToast,
} from '../../components/composite';
import { PRODUCTS, getProduct } from '../../data/products';
import { SIZE_GUIDE } from '../../data/pdp';
import { getRatingDistribution, getRelatedProducts } from '../../lib/pdp';
import { formatPrice } from '../../lib/format';
import { useCart } from '../../cart/CartContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useOffscreen } from '../../hooks/useOffscreen';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { BuyPanel } from './sections/BuyPanel';
import { HighlightsBand } from './sections/HighlightsBand';
import { DetailTabs } from './sections/DetailTabs';
import { FaqSection } from './sections/FaqSection';
import { RelatedRail } from './sections/RelatedRail';
import { RecentlyViewedRail } from './sections/RecentlyViewedRail';
import styles from './ProductPage.module.css';

export type CartPhase = 'idle' | 'loading' | 'done';

/**
 * Product detail page. Resolves the product from the route id (redirecting home
 * when unknown — the `getProduct` seam a real fetch replaces), owns the buy-flow
 * selection state, and composes the gallery + buy panel + detail sections. Every
 * section renders only when its data is present, so the page degrades gracefully.
 */
export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProduct(id) : undefined;

  useDocumentTitle(
    product ? product.name : 'Helmet',
    product?.tagline ?? product?.description,
  );

  if (!product) return <Navigate to="/" replace />;
  return <ProductDetail key={product.id} product={product} />;
}

function ProductDetail({ product }: { product: NonNullable<ReturnType<typeof getProduct>> }) {
  const navigate = useNavigate();
  const { add } = useCart();

  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];
  const firstAvailable = sizes.findIndex((s) => s.available);

  const [colorIndex, setColorIndex] = useState(0);
  const [sizeIndex, setSizeIndex] = useState(firstAvailable === -1 ? 0 : firstAvailable);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [guideOpen, setGuideOpen] = useState(false);
  const [cartPhase, setCartPhase] = useState<CartPhase>('idle');
  const [toastVisible, setToastVisible] = useState(false);

  const [ctaRef, ctaOffscreen] = useOffscreen<HTMLDivElement>();
  const recentIds = useRecentlyViewed(product.id);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const distribution = useMemo(() => getRatingDistribution(product), [product]);
  const related = useMemo(() => getRelatedProducts(product, PRODUCTS), [product]);
  const recentProducts = useMemo(
    () => recentIds.map((rid) => getProduct(rid)).filter((p): p is typeof product => Boolean(p)),
    [recentIds],
  );

  const color = colors[colorIndex];
  const size = sizes[sizeIndex];
  const anyInStock = sizes.length === 0 || sizes.some((s) => s.available);
  const total = product.price * qty;
  const sizeShort = size?.label.split(' ')[0] ?? '';

  const pattern = color
    ? `repeating-linear-gradient(135deg, color-mix(in srgb, ${color.hex} 14%, #16161a) 0 14px, #111114 14px 28px)`
    : undefined;

  const selectionMeta = [color?.name, sizeShort && `Size ${sizeShort}`, `Qty ${qty}`]
    .filter(Boolean)
    .join(' · ');

  const addToCart = () => {
    if (cartPhase !== 'idle' || !anyInStock) return;
    setCartPhase('loading');
    timers.current.push(
      setTimeout(() => {
        add(
          {
            productId: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            color: color?.name,
            size: size?.id,
          },
          qty,
        );
        setCartPhase('done');
        setToastVisible(true);
        timers.current.push(
          setTimeout(() => {
            setCartPhase('idle');
            setToastVisible(false);
          }, 2100),
        );
      }, 750),
    );
  };

  const goReviews = () => {
    setActiveTab('reviews');
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Helmets', href: '/shop' },
    { label: product.category, href: '/shop' },
    { label: product.name },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />

      <div className={styles.wrap}>
        <Breadcrumbs
          items={crumbs}
          onNavigate={(href, e) => {
            e.preventDefault();
            navigate(href);
          }}
        />
      </div>

      <div className={styles.wrap}>
        <div className={styles.grid}>
          <div className={styles.media}>
            <ProductGallery
              views={product.views ?? [product.category]}
              pattern={pattern}
              tag={color?.name.toUpperCase()}
              badge={product.badge}
              safety={product.certification}
              lightbox
            />
          </div>

          <BuyPanel
            product={product}
            colorIndex={colorIndex}
            onColor={setColorIndex}
            sizeIndex={sizeIndex}
            onSize={setSizeIndex}
            qty={qty}
            onQty={setQty}
            cartPhase={cartPhase}
            onAddToCart={addToCart}
            onOpenGuide={() => setGuideOpen(true)}
            onGoReviews={goReviews}
            ctaRef={ctaRef}
          />
        </div>

        <HighlightsBand product={product} />
        <DetailTabs
          product={product}
          distribution={distribution}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <FaqSection product={product} />
        <div className={styles.section}>
          <RelatedRail items={related} />
        </div>
        <div className={styles.section}>
          <RecentlyViewedRail items={recentProducts} />
        </div>
      </div>

      <StickyBuyBar
        price={formatPrice(total)}
        meta={selectionMeta}
        label="Add to cart"
        phase={cartPhase}
        visible={ctaOffscreen && anyInStock}
        desktop
        onAdd={addToCart}
      />

      <SizeGuideSheet
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        columns={SIZE_GUIDE.columns}
        rows={SIZE_GUIDE.rows}
        highlight={sizeShort}
      />

      <CartToast visible={toastVisible} message="Added to cart" />
    </div>
  );
}
