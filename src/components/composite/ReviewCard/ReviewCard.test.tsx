import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import type { Review } from '../../../data/types';
import { ReviewCard } from './ReviewCard';

const REVIEW: Review = {
  id: 'r1',
  author: 'Aditya Rao',
  rating: 4,
  date: '2026-05-12',
  title: 'Worth every rupee',
  body: 'Barely notice the weight and zero wind noise at 100kmph.',
  verified: true,
};

describe('ReviewCard', () => {
  it('renders the quote, title and author', () => {
    render(<ReviewCard review={REVIEW} />);
    expect(screen.getByText(/Barely notice the weight/)).toBeInTheDocument();
    expect(screen.getByText('Worth every rupee')).toBeInTheDocument();
    expect(screen.getByText(/Aditya Rao/)).toBeInTheDocument();
  });

  it('exposes the rating as an accessible label', () => {
    render(<ReviewCard review={REVIEW} />);
    expect(screen.getByRole('img', { name: '4 out of 5 stars' })).toBeInTheDocument();
  });

  it('shows the verified marker and the model when provided', () => {
    render(<ReviewCard review={REVIEW} model="Velocity RS" />);
    expect(screen.getByText(/Velocity RS/)).toBeInTheDocument();
    expect(screen.getByText(/Verified/)).toBeInTheDocument();
  });

  it('omits the verified marker for unverified reviews', () => {
    render(<ReviewCard review={{ ...REVIEW, verified: false }} />);
    expect(screen.queryByText(/Verified/)).not.toBeInTheDocument();
  });

  it('renders a long quote in full (wraps rather than overflowing)', () => {
    const longQuote =
      'Absolutely brilliant helmet and the service was even better — the team spent ' +
      'twenty minutes helping me find the right fit, talked me through the safety ' +
      'ratings, and threw in a free anti-fog kit. I have already recommended them to ' +
      'every rider I know and will be back for my next lid without a second thought.';
    render(<ReviewCard review={{ ...REVIEW, body: longQuote }} />);
    expect(screen.getByText(longQuote)).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<ReviewCard review={REVIEW} model="Velocity RS" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
