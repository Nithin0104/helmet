import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { X } from 'lucide-react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('is decorative by default: hidden from the accessibility tree, no accessible name', () => {
    const { container } = render(<Icon icon={X} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('exposes an accessible name via role="img" when label is set', () => {
    render(<Icon icon={X} label="Close" />);
    expect(screen.getByRole('img', { name: 'Close' })).toBeInTheDocument();
  });

  it('applies the token size variable from the size prop', () => {
    const { container } = render(<Icon icon={X} size="lg" />);
    expect(container.querySelector('svg')).toHaveStyle({ '--icon-size': 'var(--icon-lg)' });
  });

  it('accepts a raw px number as a size escape hatch', () => {
    const { container } = render(<Icon icon={X} size={32} />);
    expect(container.querySelector('svg')).toHaveStyle({ '--icon-size': '32px' });
  });

  it('defaults strokeWidth to 2 and honours an override', () => {
    const { container, rerender } = render(<Icon icon={X} />);
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '2');
    rerender(<Icon icon={X} strokeWidth={1.5} />);
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '1.5');
  });

  it('has no detectable accessibility violations (decorative)', async () => {
    const { container } = render(<Icon icon={X} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no detectable accessibility violations (labelled)', async () => {
    const { container } = render(<Icon icon={X} label="Close" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
