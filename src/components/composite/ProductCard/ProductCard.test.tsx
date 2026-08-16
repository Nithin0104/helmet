import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { useLocation } from 'react-router-dom';
import { renderWithProviders, screen, userEvent, within } from '../../../../tests/utils';
import { useCart } from '../../../cart/CartContext';
import type { Product } from '../../../data/types';
import { ProductCard } from './ProductCard';

const PRODUCT: Product = {
  id: 'velocity-rs-carbon',
  name: 'Velocity RS Carbon',
  brand: 'Apexline',
  category: 'Full-face',
  price: 42999,
  rating: 4.7,
  reviewCount: 128,
  badge: 'Bestseller',
};

/** A variant product (helmet) — carries colours/sizes, so add must go via the PDP. */
const VARIANT_PRODUCT: Product = {
  ...PRODUCT,
  colors: [{ id: 'matte-black', name: 'Matte Black', hex: '#1a1a1c' }],
  sizes: [{ id: 'm', label: 'M (57-58cm)', available: true }],
};

function CartCount() {
  const { count } = useCart();
  return <output data-testid="count">{count}</output>;
}

function LocationProbe() {
  const { pathname } = useLocation();
  return <output data-testid="path">{pathname}</output>;
}

describe('ProductCard', () => {
  it('renders brand, name, formatted price and rating', () => {
    renderWithProviders(<ProductCard product={PRODUCT} />, { route: '/' });

    expect(screen.getByText('Velocity RS Carbon')).toBeInTheDocument();
    expect(screen.getByText('Apexline')).toBeInTheDocument();
    expect(screen.getByText(/42,999/)).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
    expect(screen.getByText('(128)')).toBeInTheDocument();
  });

  it('links the product name to its detail page', () => {
    renderWithProviders(<ProductCard product={PRODUCT} />, { route: '/' });
    expect(screen.getByRole('link', { name: 'Velocity RS Carbon' })).toHaveAttribute(
      'href',
      '/product/velocity-rs-carbon',
    );
  });

  it('adds to the cart via useCart by default when the + button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ProductCard product={PRODUCT} />
        <CartCount />
      </>,
      { route: '/' },
    );

    await user.click(screen.getByRole('button', { name: 'Add Velocity RS Carbon to cart' }));

    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('calls a supplied onAdd instead of the default add', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(<ProductCard product={PRODUCT} onAdd={onAdd} />, { route: '/' });

    await user.click(screen.getByRole('button', { name: 'Add Velocity RS Carbon to cart' }));

    expect(onAdd).toHaveBeenCalledWith(PRODUCT);
  });

  it('disables add and shows the out-of-stock overlay when soldOut', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(<ProductCard product={PRODUCT} soldOut onAdd={onAdd} />, { route: '/' });

    expect(screen.getByText('OUT OF STOCK')).toBeInTheDocument();
    const addBtn = screen.getByRole('button', { name: 'Add Velocity RS Carbon to cart' });
    expect(addBtn).toBeDisabled();

    await user.click(addBtn);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('renders the save heart and quick-add when enabled', () => {
    renderWithProviders(<ProductCard product={PRODUCT} heart quickAdd />, { route: '/' });
    expect(screen.getByRole('button', { name: 'Save Velocity RS Carbon' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ QUICK ADD' })).toBeInTheDocument();
  });

  it('toggles the wishlist saved state when the save button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductCard product={PRODUCT} heart />, { route: '/' });

    const save = screen.getByRole('button', { name: 'Save Velocity RS Carbon' });
    expect(save).toHaveAttribute('aria-pressed', 'false');

    await user.click(save);

    expect(
      screen.getByRole('button', { name: 'Remove Velocity RS Carbon from your wishlist' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('reflects a pre-seeded wishlist as already saved', () => {
    renderWithProviders(<ProductCard product={PRODUCT} heart />, {
      route: '/',
      initialWishlist: ['velocity-rs-carbon'],
    });
    expect(
      screen.getByRole('button', { name: 'Remove Velocity RS Carbon from your wishlist' }),
    ).toBeInTheDocument();
  });

  it('routes a variant product to its PDP instead of adding a bare cart line', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ProductCard product={VARIANT_PRODUCT} quickAdd />
        <LocationProbe />
        <CartCount />
      </>,
      { route: '/' },
    );

    // The quick-add bar reads "SELECT OPTIONS", and the footer button offers options.
    expect(screen.getByRole('button', { name: 'SELECT OPTIONS' })).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Choose options for Velocity RS Carbon' }),
    );

    expect(screen.getByTestId('path')).toHaveTextContent('/product/velocity-rs-carbon');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('adds a variant-less product straight to the cart from quick-add', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ProductCard product={PRODUCT} quickAdd />
        <CartCount />
      </>,
      { route: '/' },
    );

    await user.click(screen.getByRole('button', { name: '+ QUICK ADD' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('shows the struck original price and % off when on offer', () => {
    const onOffer: Product = { ...PRODUCT, price: 42999, compareAtPrice: 47999 };
    renderWithProviders(<ProductCard product={onOffer} />, { route: '/' });
    expect(screen.getByText(/42,999/)).toBeInTheDocument();
    expect(screen.getByText(/47,999/)).toBeInTheDocument();
    expect(screen.getByText('-10%')).toBeInTheDocument();
  });

  it('omits the discount markup when there is no compareAtPrice', () => {
    renderWithProviders(<ProductCard product={PRODUCT} />, { route: '/' });
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
  });

  it('wraps the name in a heading of the requested level', () => {
    renderWithProviders(<ProductCard product={PRODUCT} headingLevel={2} />, { route: '/' });
    const heading = screen.getByRole('heading', { level: 2, name: 'Velocity RS Carbon' });
    expect(heading).toBeInTheDocument();
    // The name is still a link inside the heading.
    expect(within(heading).getByRole('link')).toHaveAttribute('href', '/product/velocity-rs-carbon');
  });

  it('exposes an accessible rating phrase', () => {
    renderWithProviders(<ProductCard product={PRODUCT} />, { route: '/' });
    expect(screen.getByText('Rated 4.7 out of 5, 128 reviews')).toBeInTheDocument();
  });

  it('shows the certification only when showCertification is set', () => {
    const certified: Product = { ...PRODUCT, certification: 'ECE 22.06' };
    const { rerender } = renderWithProviders(<ProductCard product={certified} />, { route: '/' });
    expect(screen.queryByText('ECE 22.06')).not.toBeInTheDocument();
    rerender(<ProductCard product={certified} showCertification />);
    expect(screen.getByText('ECE 22.06')).toBeInTheDocument();
  });

  it('renders a very long product name without breaking', () => {
    const longName =
      'Velocity RS Carbon Pro Max Ultra Track Race Limited Anniversary Edition Helmet';
    renderWithProviders(<ProductCard product={{ ...PRODUCT, name: longName }} />, { route: '/' });
    expect(screen.getByRole('link', { name: longName })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<ProductCard product={PRODUCT} heart quickAdd />, {
      route: '/',
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
