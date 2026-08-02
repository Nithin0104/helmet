import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteLayout } from './components/layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ShowcasePage from './pages/ShowcasePage';

/**
 * App routing. Store pages render inside the full SiteLayout (header + footer +
 * accent glow); checkout uses the minimal layout; the Showcase page stands
 * alone as a design/dev reference. Unknown paths redirect home.
 */
function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>
      <Route element={<SiteLayout minimal />}>
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>
      <Route path="/showcase" element={<ShowcasePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
