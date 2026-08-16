import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ProductReview } from './ProductReview';

describe('ProductReview', () => {
  it('renders author, title and body', () => {
    render(
      <ProductReview author="James T." title="Great helmet" body="Lightweight and quiet." rating={5} />,
    );
    expect(screen.getByText('James T.')).toBeInTheDocument();
    expect(screen.getByText('Great helmet')).toBeInTheDocument();
    expect(screen.getByText('Lightweight and quiet.')).toBeInTheDocument();
  });

  it('exposes the rating as an accessible star label', () => {
    render(<ProductReview author="A" rating={4} />);
    expect(screen.getByRole('img', { name: '4 out of 5 stars' })).toBeInTheDocument();
  });

  it('shows the verified badge by default and hides it when verified is false', () => {
    const { rerender } = render(<ProductReview author="A" />);
    expect(screen.getByText('✓ Verified purchase')).toBeInTheDocument();
    rerender(<ProductReview author="A" verified={false} />);
    expect(screen.queryByText('✓ Verified purchase')).not.toBeInTheDocument();
  });

  it('renders meta context when provided', () => {
    render(<ProductReview author="A" meta="Size L · Matte Black" />);
    expect(screen.getByText('Size L · Matte Black')).toBeInTheDocument();
  });

  it('clamps the rating to the 0–5 range', () => {
    render(<ProductReview author="A" rating={9} />);
    expect(screen.getByRole('img', { name: '5 out of 5 stars' })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <ProductReview author="James T." date="12 Jun 2026" rating={5} title="t" body="b" meta="Size L" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
