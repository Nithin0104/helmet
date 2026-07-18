import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { CartToast } from './CartToast';

describe('CartToast', () => {
  it('renders nothing when not visible', () => {
    render(<CartToast visible={false} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders the default message when visible', () => {
    render(<CartToast visible />);
    expect(screen.getByRole('status')).toHaveTextContent('Added to cart');
  });

  it('renders a custom message', () => {
    render(<CartToast visible message="Saved for later" />);
    expect(screen.getByRole('status')).toHaveTextContent('Saved for later');
  });

  it('announces politely for screen readers', () => {
    render(<CartToast visible />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<CartToast visible />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
