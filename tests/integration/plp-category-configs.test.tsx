import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '../utils';
import ShopPage from '../../src/pages/ShopPage';
import { PLP_CONFIGS } from '../../src/data/plp';

// Force the desktop branch so the sidebar (not the mobile sheet) renders.
const layout = vi.hoisted(() => ({ desktop: true }));
vi.mock('../../src/hooks/useMediaQuery', () => ({
  useMediaQuery: () => layout.desktop,
  useIsDesktop: () => layout.desktop,
}));

beforeEach(() => {
  layout.desktop = true;
});

describe('Accessories PLP (config-driven)', () => {
  it('renders its own title, count noun and the 3-facet rail', () => {
    renderWithProviders(<ShopPage config={PLP_CONFIGS.accessories} />, { route: '/accessories' });

    expect(screen.getByRole('heading', { name: 'Accessories', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/of \d+ accessories/)).toBeInTheDocument();
    // Only Category / Brand / Price groups (no Safety/Colour/Size).
    expect(screen.getByRole('group', { name: 'Category' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Brand' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Safety Rating' })).not.toBeInTheDocument();
  });

  it('opens only the first accordion (Category), leaving the rest collapsed', () => {
    renderWithProviders(<ShopPage config={PLP_CONFIGS.accessories} />, { route: '/accessories' });

    // Category (first) is expanded → its options are visible.
    const categoryHead = screen.getByRole('button', { name: /Category/ });
    expect(categoryHead).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('checkbox', { name: /Gloves/ })).toBeInTheDocument();

    // Brand (second) starts collapsed → its options are not rendered.
    const brandHead = screen.getByRole('button', { name: /Brand/ });
    expect(brandHead).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('checkbox', { name: /Axor/ })).not.toBeInTheDocument();
  });

  it('scopes the brand facet to the selected category (shows an IN … note)', () => {
    renderWithProviders(<ShopPage config={PLP_CONFIGS.accessories} />, {
      route: '/accessories?cat=gloves',
    });
    expect(screen.getByText('IN GLOVES')).toBeInTheDocument();
  });
});

describe('Spares & Care PLP (config-driven)', () => {
  it('renders the merged catalog with its title and Category rail', () => {
    renderWithProviders(<ShopPage config={PLP_CONFIGS['spares-care']} />, { route: '/spares-care' });

    expect(screen.getByRole('heading', { name: 'Spares & Care', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/of \d+ items/)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Category' })).toBeInTheDocument();
  });

  it('shows a sold-out card for an out-of-stock spare on the first page', () => {
    renderWithProviders(<ShopPage config={PLP_CONFIGS['spares-care']} />, { route: '/spares-care' });
    // "ADV Peak + Visor Set" is inStock:false and sits within the first page.
    expect(screen.getAllByText('OUT OF STOCK').length).toBeGreaterThan(0);
  });
});
