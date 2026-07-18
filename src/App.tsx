import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SiteLayout } from './components/layout';
import { ProductCard, BrandStrip, ReviewCard, CartToast } from './components/composite';
import { PRODUCTS } from './data/products';
import type { Product } from './data/types';
import { useTheme } from './theme/ThemeContext';
import { ACCENTS, ACCENT_KEYS } from './theme/accents';
import { useCart } from './cart/CartContext';
import ShowcasePage from './pages/ShowcasePage';

/**
 * Phase 2 home harness: exercises every composite (cards, brand strip, reviews,
 * toast) inside the real SiteLayout so the header/footer/overlays can be driven
 * in the browser. Replaced by the real HomePage in Phase 3.
 */
function Home() {
  const { accentKey, setAccent } = useTheme();
  const { add } = useCart();
  const [toast, setToast] = useState(false);

  const handleAdd = (product: Product) => {
    add({ productId: product.id, name: product.name, brand: product.brand, price: product.price });
    setToast(true);
    window.setTimeout(() => setToast(false), 2200);
  };

  const reviews = PRODUCTS[0].reviews ?? [];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px 64px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', letterSpacing: '.08em' }}>
        PHASE 2 — COMPOSITES & LAYOUT
      </p>
      <h1 style={{ fontSize: 34, fontWeight: 800, margin: '8px 0 20px' }}>
        Gear up for the ride
      </h1>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {ACCENT_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setAccent(key)}
            aria-label={`Set accent to ${key}`}
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: ACCENTS[key].base,
              border: key === accentKey ? '2px solid var(--text)' : '2px solid transparent',
              opacity: key === accentKey ? 1 : 0.55,
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}
      >
        {PRODUCTS.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            heart
            quickAdd
            soldOut={i === 3}
            onAdd={handleAdd}
          />
        ))}
      </div>

      <BrandStrip />

      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '40px 0 16px' }}>What riders say</h2>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} model={PRODUCTS[0].name} />
        ))}
      </div>

      <CartToast visible={toast} />
    </div>
  );
}

function Stub({ title }: { title: string }) {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 20px', minHeight: '50vh' }}>
      <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', letterSpacing: '.08em' }}>
        PHASE 3 STUB
      </p>
      <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{title}</h1>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Stub title="Shop — product listing" />} />
        <Route path="/product/:id" element={<Stub title="Product detail" />} />
        <Route path="/cart" element={<Stub title="Your cart" />} />
      </Route>
      <Route element={<SiteLayout minimal />}>
        <Route path="/checkout" element={<Stub title="Checkout" />} />
      </Route>
      <Route path="/showcase" element={<ShowcasePage />} />
    </Routes>
  );
}

export default App;
