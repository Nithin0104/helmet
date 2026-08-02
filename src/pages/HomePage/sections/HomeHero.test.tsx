import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen } from '../../../../tests/utils';
import { HERO } from '../../../data/home';
import { HomeHero } from './HomeHero';

describe('HomeHero', () => {
  it('renders the headline, badge, and both CTAs with their targets', () => {
    renderWithProviders(<HomeHero />, { route: '/' });

    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      `${HERO.headlineTop} ${HERO.headlineAccent} ${HERO.headlineBottom}`,
    );
    expect(screen.getByText(HERO.badge)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: HERO.primary.label })).toHaveAttribute(
      'href',
      HERO.primary.href,
    );
    expect(screen.getByRole('link', { name: HERO.secondary.label })).toHaveAttribute(
      'href',
      HERO.secondary.href,
    );
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<HomeHero />, { route: '/' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
