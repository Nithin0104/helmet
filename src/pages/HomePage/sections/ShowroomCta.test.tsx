import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen } from '../../../../tests/utils';
import { SHOWROOM } from '../../../data/home';
import { ShowroomCta } from './ShowroomCta';

describe('ShowroomCta', () => {
  it('renders the heading, address/hours, and both CTAs', () => {
    renderWithProviders(<ShowroomCta />, { route: '/' });

    expect(screen.getByRole('heading', { level: 2, name: /see it/i })).toBeInTheDocument();
    expect(screen.getByText(/RIVERSIDE WORKS/)).toBeInTheDocument();
    expect(screen.getByText(/OPEN MON/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: SHOWROOM.primary.label })).toHaveAttribute(
      'href',
      SHOWROOM.primary.href,
    );
    expect(screen.getByRole('link', { name: SHOWROOM.secondary.label })).toHaveAttribute(
      'href',
      SHOWROOM.secondary.href,
    );
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<ShowroomCta />, { route: '/' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
