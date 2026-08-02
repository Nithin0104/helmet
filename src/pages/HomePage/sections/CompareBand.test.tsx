import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen } from '../../../../tests/utils';
import { COMPARE } from '../../../data/home';
import { CompareBand } from './CompareBand';

describe('CompareBand', () => {
  it('renders the heading, copy, and the CTA link', () => {
    renderWithProviders(<CompareBand />, { route: '/' });

    expect(screen.getByRole('heading', { name: COMPARE.heading })).toBeInTheDocument();
    expect(screen.getByText(COMPARE.copy)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: COMPARE.link.label })).toHaveAttribute(
      'href',
      COMPARE.link.href,
    );
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<CompareBand />, { route: '/' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
