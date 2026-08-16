import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import ProductPage from '../../src/pages/ProductPage';
import { DetailTabs } from '../../src/pages/ProductPage/sections/DetailTabs';
import { useCart } from '../../src/cart/CartContext';
import type { Product } from '../../src/data/types';
import { renderWithProviders, screen, userEvent, waitFor } from '../utils';

function CartCount() {
  const { count } = useCart();
  return <span data-testid="cart-count">{count}</span>;
}

function renderPdp(route = '/product/velocity-rs-carbon') {
  return renderWithProviders(
    <>
      <CartCount />
      <Routes>
        <Route path="/" element={<div>home page</div>} />
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
    </>,
    { route },
  );
}

describe('PDP flow integration', () => {
  it('renders the resolved product identity and add-to-cart CTA', () => {
    renderPdp();
    expect(screen.getByRole('heading', { level: 1, name: 'Velocity RS Carbon' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Product images' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add to cart/ })).toBeInTheDocument();
  });

  it('selecting colour + size + qty and adding updates the cart and shows a toast', async () => {
    const user = userEvent.setup();
    renderPdp();

    await user.click(screen.getByRole('radio', { name: 'Racing Red' }));
    await user.click(screen.getByRole('radio', { name: 'M (57-58cm)' }));
    await user.click(screen.getByRole('button', { name: 'Increase quantity' })); // qty 2

    await user.click(screen.getByRole('button', { name: /Add to cart/ }));

    await waitFor(() => expect(screen.getByTestId('cart-count')).toHaveTextContent('2'));
    expect(await screen.findByRole('status')).toHaveTextContent('Added to cart');

    const cart = JSON.parse(localStorage.getItem('apex_cart')!);
    expect(cart).toHaveLength(1);
    expect(cart[0]).toMatchObject({
      productId: 'velocity-rs-carbon',
      color: 'Racing Red',
      size: 'm',
      qty: 2,
    });
  });

  it('marks a sold-out size as disabled', () => {
    renderPdp();
    // Velocity RS Carbon is out of stock in XL and XXL.
    expect(screen.getByRole('radio', { name: 'XL (61-62cm) — Sold out' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('redirects to home for an unknown product id', () => {
    renderPdp('/product/does-not-exist');
    expect(screen.getByText('home page')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('records the viewed product in localStorage for the recently-viewed rail', () => {
    renderPdp();
    const recent = JSON.parse(localStorage.getItem('apex_recently_viewed')!);
    expect(recent).toContain('velocity-rs-carbon');
  });

  it('shows an empty state in the Reviews tab when a product has no reviews', async () => {
    const user = userEvent.setup();
    const bare: Product = {
      id: 'bare',
      name: 'Bare Helmet',
      brand: 'Test',
      category: 'Full-face',
      price: 9999,
      rating: 0,
      reviewCount: 0,
      description: 'A helmet with no reviews yet.',
      reviews: [],
    };
    renderWithProviders(
      <DetailTabs product={bare} distribution={[]} activeTab="reviews" onTabChange={() => {}} />,
    );
    await user.click(screen.getByRole('tab', { name: 'Reviews' }));
    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
  });
});
