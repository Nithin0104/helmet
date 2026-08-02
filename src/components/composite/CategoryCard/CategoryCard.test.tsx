import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen } from '../../../../tests/utils';
import { CategoryCard } from './CategoryCard';

describe('CategoryCard', () => {
  it('renders the category as a link with its title, kicker and caption', () => {
    renderWithProviders(
      <CategoryCard kicker="CAT 01" title="Helmets" caption="Full-face · modular" href="/shop" />,
      { route: '/' },
    );

    const link = screen.getByRole('link', { name: 'Helmets' });
    expect(link).toHaveAttribute('href', '/shop');
    expect(screen.getByText('CAT 01')).toBeInTheDocument();
    expect(screen.getByText('Full-face · modular')).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(
      <CategoryCard kicker="CAT 02" title="Spares" caption="Visors · liners" href="/shop" />,
      { route: '/' },
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
