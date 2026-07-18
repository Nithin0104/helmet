import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen } from '../../../../tests/utils';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  it('renders default columns and their links', () => {
    renderWithProviders(<SiteFooter />, { route: '/' });
    expect(screen.getByText('SHOP')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Size guide' })).toBeInTheDocument();
  });

  it('renders custom columns when provided', () => {
    renderWithProviders(
      <SiteFooter columns={[{ h: 'LEGAL', items: ['Privacy', 'Terms'] }]} />,
      { route: '/' },
    );
    expect(screen.getByText('LEGAL')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeInTheDocument();
    expect(screen.queryByText('SHOP')).not.toBeInTheDocument();
  });

  it('can hide the logo', () => {
    renderWithProviders(<SiteFooter showLogo={false} />, { route: '/' });
    expect(screen.queryByRole('link', { name: 'APEXLINE' })).not.toBeInTheDocument();
  });

  it('shows the copyright line', () => {
    renderWithProviders(<SiteFooter copyright="© 2026 TEST" />, { route: '/' });
    expect(screen.getByText(/© 2026 TEST/)).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<SiteFooter />, { route: '/' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
