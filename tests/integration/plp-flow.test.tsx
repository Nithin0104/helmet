import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, within } from '../utils';
import ShopPage from '../../src/pages/ShopPage';

// Control the responsive branch (jsdom's matchMedia is stubbed to non-matching).
const layout = vi.hoisted(() => ({ desktop: true }));
vi.mock('../../src/hooks/useMediaQuery', () => ({
  useMediaQuery: () => layout.desktop,
  useIsDesktop: () => layout.desktop,
}));

beforeEach(() => {
  layout.desktop = true;
});

describe('PLP flow (desktop)', () => {
  it('renders the grid with the full-catalog result count', () => {
    renderWithProviders(<ShopPage />, { route: '/shop' });
    expect(screen.getByRole('heading', { name: 'Helmets', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/of 24 helmets/)).toBeInTheDocument();
  });

  it('narrows results and updates the count when a brand facet is toggled', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ShopPage />, { route: '/shop' });

    await user.click(screen.getByRole('checkbox', { name: /Royal Enfield/ }));

    expect(screen.getByText(/of 3 helmets/)).toBeInTheDocument();
  });

  it('applies a sort selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ShopPage />, { route: '/shop' });

    await user.click(screen.getByRole('button', { name: /Sort/ }));
    await user.click(screen.getByRole('option', { name: 'Price: Low to High' }));

    expect(screen.getByText('Price: Low to High')).toBeInTheDocument();
  });

  it('paginates and reflects the page slice in the count', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ShopPage />, { route: '/shop' });

    expect(screen.getByText(/Showing 1\D+9 of 24 helmets/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText(/Showing 10\D+18 of 24 helmets/)).toBeInTheDocument();
  });

  it('hydrates filter state from a deep-linked query string', () => {
    renderWithProviders(<ShopPage />, { route: '/shop?brand=royal-enfield' });
    expect(screen.getByText(/of 3 helmets/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Royal Enfield/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('shows the empty state for a no-match combination and clears it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ShopPage />, { route: '/shop?brand=royal-enfield&type=open-face' });

    expect(screen.getByText('No helmets match')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));

    expect(screen.getByText(/of 24 helmets/)).toBeInTheDocument();
  });

  it('removes a single filter via its applied chip', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ShopPage />, { route: '/shop?brand=royal-enfield' });

    expect(screen.getByText(/of 3 helmets/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Remove Brand Royal Enfield/ }));

    expect(screen.getByText(/of 24 helmets/)).toBeInTheDocument();
  });
});

describe('PLP flow (mobile)', () => {
  it('swaps the sidebar for a filter sheet opened from the toolbar', async () => {
    layout.desktop = false;
    const user = userEvent.setup();
    renderWithProviders(<ShopPage />, { route: '/shop' });

    // No desktop sidebar; a Filters button opens the sheet instead.
    await user.click(screen.getByRole('button', { name: /Filters/ }));

    const sheet = screen.getByRole('dialog', { name: 'Filters' });
    expect(within(sheet).getByText('Brand')).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: /Show \d+ results/ })).toBeInTheDocument();
  });
});
