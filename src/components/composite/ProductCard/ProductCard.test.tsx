import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen, userEvent } from '../../../../tests/utils';
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

function CartCount() {
  const { count } = useCart();
  return <output data-testid="count">{count}</output>;
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

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<ProductCard product={PRODUCT} heart quickAdd />, {
      route: '/',
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
