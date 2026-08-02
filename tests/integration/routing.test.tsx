import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import App from '../../src/App';
import { PRODUCTS } from '../../src/data/products';
import { renderWithProviders } from '../utils/renderWithProviders';

/**
 * Guards the app's route table: each path renders its page inside the right
 * layout, unknown paths and unknown product ids redirect home, and the minimal
 * checkout shell drops the footer. Page bodies are Phase 3 scaffolds; these
 * assertions target the routing behavior, which is stable as pages fill in.
 */

const h1 = (name: string | RegExp) => screen.getByRole('heading', { level: 1, name });

describe('app routing', () => {
  it('renders the home page at /', () => {
    renderWithProviders(<App />, { route: '/' });
    expect(h1(/30% off select lids/i)).toBeInTheDocument();
  });

  it('renders the shop page at /shop', () => {
    renderWithProviders(<App />, { route: '/shop' });
    expect(h1(/all helmets/i)).toBeInTheDocument();
  });

  it('renders a product page for a known id', () => {
    const product = PRODUCTS[0];
    renderWithProviders(<App />, { route: `/product/${product.id}` });
    expect(h1(product.name)).toBeInTheDocument();
  });

  it('redirects an unknown product id home', () => {
    renderWithProviders(<App />, { route: '/product/does-not-exist' });
    expect(h1(/30% off select lids/i)).toBeInTheDocument();
  });

  it('renders the cart page at /cart', () => {
    renderWithProviders(<App />, { route: '/cart' });
    expect(h1(/your cart/i)).toBeInTheDocument();
  });

  it('renders the checkout page in the minimal layout (no footer nav)', () => {
    renderWithProviders(<App />, { route: '/checkout' });
    expect(h1(/secure checkout/i)).toBeInTheDocument();
    // Minimal layout drops the full site footer.
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('renders the standalone showcase page at /showcase', () => {
    renderWithProviders(<App />, { route: '/showcase' });
    expect(h1(/primitives/i)).toBeInTheDocument();
  });

  it('redirects an unknown path home', () => {
    renderWithProviders(<App />, { route: '/no/such/route' });
    expect(h1(/30% off select lids/i)).toBeInTheDocument();
  });
});
