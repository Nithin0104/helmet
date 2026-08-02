import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen } from '../../../../tests/utils';
import { CATEGORIES } from '../../../data/home';
import { CategoryStrip } from './CategoryStrip';

describe('CategoryStrip', () => {
  it('renders the heading and one linked card per category', () => {
    renderWithProviders(<CategoryStrip />, { route: '/' });

    expect(screen.getByRole('heading', { name: /shop the range/i })).toBeInTheDocument();
    for (const category of CATEGORIES) {
      expect(screen.getByRole('link', { name: category.title })).toHaveAttribute(
        'href',
        category.href,
      );
    }
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<CategoryStrip />, { route: '/' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
