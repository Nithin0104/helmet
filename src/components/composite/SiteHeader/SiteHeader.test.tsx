import { describe, expect, it, vi, afterEach } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen, userEvent } from '../../../../tests/utils';
import type { CartLine } from '../../../cart/CartContext';
import { SiteHeader } from './SiteHeader';

/** Force useIsDesktop's matchMedia result for a test. */
function setDesktop(isDesktop: boolean) {
  window.matchMedia = ((query: string) =>
    ({
      matches: isDesktop,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
}

const CART: CartLine[] = [
  { id: 'a', productId: 'a', name: 'A', brand: 'Apexline', price: 1000, qty: 3 },
];

afterEach(() => setDesktop(false));

describe('SiteHeader', () => {
  it('renders the mobile header with a menu toggle below 800px', () => {
    setDesktop(false);
    renderWithProviders(<SiteHeader />, { route: '/' });
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('opens the SlideNav overlay when the hamburger is clicked', async () => {
    const user = userEvent.setup();
    setDesktop(false);
    renderWithProviders(<SiteHeader />, { route: '/' });

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument();
  });

  it('renders the desktop nav with links at/above 800px', () => {
    setDesktop(true);
    renderWithProviders(<SiteHeader activePage="Helmets" />, { route: '/' });

    const helmets = screen.getByRole('link', { name: 'Helmets' });
    expect(helmets).toHaveAttribute('href', '/helmets');
    expect(helmets).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('button', { name: 'Open menu' })).not.toBeInTheDocument();
  });

  it('cart icon links to /cart and shows the live count badge', () => {
    setDesktop(true);
    renderWithProviders(<SiteHeader />, { route: '/', initialCart: CART });

    const cart = screen.getByRole('link', { name: 'Cart' });
    expect(cart).toHaveAttribute('href', '/cart');
    expect(cart).toHaveTextContent('3');
  });

  it('hides the badge when the cart is empty', () => {
    setDesktop(true);
    renderWithProviders(<SiteHeader />, { route: '/' });
    expect(screen.getByRole('link', { name: 'Cart' })).not.toHaveTextContent(/\d/);
  });

  it('opens the SearchPanel when the search icon is clicked', async () => {
    const user = userEvent.setup();
    setDesktop(true);
    renderWithProviders(<SiteHeader />, { route: '/' });

    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('dialog', { name: 'Search' })).toBeInTheDocument();
  });

  it('minimal variant shows the secure-checkout bar and no nav', () => {
    setDesktop(true);
    renderWithProviders(<SiteHeader minimal />, { route: '/checkout' });

    expect(screen.getByText('SECURE CHECKOUT')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Search' })).not.toBeInTheDocument();
  });

  it('has no detectable accessibility violations (desktop)', async () => {
    setDesktop(true);
    const { container } = renderWithProviders(<SiteHeader activePage="Helmets" />, { route: '/' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
