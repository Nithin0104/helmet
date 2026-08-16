import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen } from '../../../tests/utils';
import { SiteLayout } from './SiteLayout';

describe('SiteLayout', () => {
  it('wraps content with header and footer', () => {
    renderWithProviders(
      <SiteLayout>
        <p>Page body</p>
      </SiteLayout>,
      { route: '/' },
    );

    expect(screen.getByText('Page body')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    expect(screen.getByRole('main')).toHaveTextContent('Page body');
  });

  it('minimal variant drops the footer and shows the checkout bar', () => {
    renderWithProviders(
      <SiteLayout minimal>
        <p>Checkout body</p>
      </SiteLayout>,
      { route: '/checkout' },
    );

    expect(screen.getByText('SECURE CHECKOUT')).toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(
      <SiteLayout>
        <p>Page body</p>
      </SiteLayout>,
      { route: '/' },
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
