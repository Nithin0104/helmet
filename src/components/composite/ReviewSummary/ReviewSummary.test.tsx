import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ReviewSummary } from './ReviewSummary';

const DIST = [
  { n: 5, count: 186 },
  { n: 4, count: 18 },
  { n: 3, count: 5 },
  { n: 2, count: 2 },
  { n: 1, count: 1 },
];

describe('ReviewSummary', () => {
  it('renders the score and a review count', () => {
    render(<ReviewSummary score={4.7} count={212} distribution={DIST} />);
    expect(screen.getByText('4.7')).toBeInTheDocument();
    expect(screen.getByText('212 REVIEWS')).toBeInTheDocument();
  });

  it('defaults the count to the distribution sum when count is omitted', () => {
    render(<ReviewSummary score={4.7} distribution={DIST} />);
    expect(screen.getByText('212 REVIEWS')).toBeInTheDocument();
  });

  it('describes the histogram for screen readers', () => {
    render(<ReviewSummary score={4.7} count={212} distribution={DIST} />);
    const hist = screen.getByRole('img');
    expect(hist).toHaveAttribute('aria-label', expect.stringContaining('Average 4.7 out of 5'));
    expect(hist.getAttribute('aria-label')).toContain('186 rated 5 stars');
  });

  it('renders a bar per rating bucket', () => {
    render(<ReviewSummary score={4.7} distribution={DIST} />);
    expect(screen.getByText('5★')).toBeInTheDocument();
    expect(screen.getByText('1★')).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<ReviewSummary score={4.7} count={212} distribution={DIST} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
