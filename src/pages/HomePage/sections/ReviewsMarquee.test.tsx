import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen } from '../../../../tests/utils';
import { HOME_REVIEWS } from '../../../data/home';
import { ReviewsMarquee } from './ReviewsMarquee';

describe('ReviewsMarquee', () => {
  it('renders the heading and a card for each testimonial', () => {
    renderWithProviders(<ReviewsMarquee />, { route: '/' });

    expect(screen.getByRole('heading', { name: /riders rate us/i })).toBeInTheDocument();
    for (const review of HOME_REVIEWS) {
      const namePattern = new RegExp(review.name.replace(/[.]/g, '\\.'));
      expect(screen.getAllByText(namePattern).length).toBeGreaterThan(0);
    }
  });

  it('passes each review its real rating, not a hardcoded 5', () => {
    renderWithProviders(<ReviewsMarquee />, { route: '/' });
    // Tom's testimonial is 4 stars in the data — proves ratings are data-driven.
    expect(screen.getAllByRole('img', { name: '4 out of 5 stars' }).length).toBeGreaterThan(0);
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<ReviewsMarquee />, { route: '/' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
