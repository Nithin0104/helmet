import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen, userEvent } from '../../../../tests/utils';
import type { Product } from '../../../data/types';
import { ProductRail } from './ProductRail';
import type { RailTab } from './ProductRail';

const make = (id: string, name: string, featured?: Product['featured']): Product => ({
  id,
  name,
  brand: 'Apexline',
  category: 'Full-face',
  price: 19999,
  rating: 4.5,
  reviewCount: 42,
  featured,
});

const BEST = [make('a', 'Alpha'), make('b', 'Bravo')];
const NEW = [make('c', 'Charlie'), make('d', 'Delta')];
const TABS: RailTab[] = [
  { id: 'best', label: 'Bestsellers', items: BEST },
  { id: 'new', label: 'New Arrivals', items: NEW },
];

describe('ProductRail', () => {
  it('renders the title and a SEE ALL link', () => {
    renderWithProviders(<ProductRail title="Helmets" items={BEST} seeAllHref="/shop" />, {
      route: '/',
    });
    expect(screen.getByRole('heading', { name: 'Helmets' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /see all/i })).toHaveAttribute('href', '/shop');
  });

  it('renders a card per item', () => {
    renderWithProviders(<ProductRail title="Helmets" items={BEST} />, { route: '/' });
    expect(screen.getByRole('link', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bravo' })).toBeInTheDocument();
  });

  it('caps the number of cards at limit', () => {
    const many = [make('a', 'Alpha'), make('b', 'Bravo'), make('c', 'Charlie')];
    renderWithProviders(<ProductRail title="Helmets" items={many} limit={2} />, { route: '/' });
    expect(screen.getByRole('link', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bravo' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Charlie' })).not.toBeInTheDocument();
  });

  it('applies limit per tab', () => {
    const bigTabs: RailTab[] = [
      { id: 'best', label: 'Bestsellers', items: [make('a', 'Alpha'), make('b', 'Bravo'), make('c', 'Charlie')] },
      { id: 'new', label: 'New Arrivals', items: NEW },
    ];
    renderWithProviders(<ProductRail title="Helmets" tabs={bigTabs} limit={2} />, { route: '/' });
    expect(screen.queryByRole('link', { name: 'Charlie' })).not.toBeInTheDocument();
  });

  it('switches content when a tab is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductRail title="Helmets" tabs={TABS} />, { route: '/' });

    // First tab active by default.
    expect(screen.getByRole('link', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Charlie' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'New Arrivals' }));

    expect(screen.getByRole('link', { name: 'Charlie' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Alpha' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'New Arrivals' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('moves between tabs with the arrow keys', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductRail title="Helmets" tabs={TABS} />, { route: '/' });

    await user.click(screen.getByRole('tab', { name: 'Bestsellers' }));
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'New Arrivals' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('link', { name: 'Charlie' })).toBeInTheDocument();
  });

  it('shows an empty state when a rail has no items', () => {
    renderWithProviders(<ProductRail title="Helmets" items={[]} />, { route: '/' });
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
  });

  it('supports controlled tabs via activeTabId + onTabChange', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    renderWithProviders(
      <ProductRail title="Helmets" tabs={TABS} activeTabId="new" onTabChange={onTabChange} />,
      { route: '/' },
    );

    // Controlled to "new": Charlie is shown, Alpha is not.
    expect(screen.getByRole('link', { name: 'Charlie' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Alpha' })).not.toBeInTheDocument();

    // Clicking Bestsellers reports the change but doesn't self-update (parent owns state).
    await user.click(screen.getByRole('tab', { name: 'Bestsellers' }));
    expect(onTabChange).toHaveBeenCalledWith('best');
    expect(screen.getByRole('link', { name: 'Charlie' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Alpha' })).not.toBeInTheDocument();
  });

  it('renders skeleton placeholders while loading', () => {
    renderWithProviders(<ProductRail title="Helmets" tabs={TABS} loading skeletonCount={3} />, {
      route: '/',
    });
    const region = screen.getByRole('status', { name: 'Loading Helmets' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    // No real product content while loading.
    expect(screen.queryByRole('link', { name: 'Alpha' })).not.toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<ProductRail title="Helmets" tabs={TABS} />, {
      route: '/',
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
