import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Marquee } from './Marquee';

describe('Marquee', () => {
  it('renders items twice (visible track + aria-hidden duplicate for seamless loop)', () => {
    render(<Marquee items={['Free shipping', 'Lifetime warranty']} />);
    expect(screen.getAllByText('Free shipping')).toHaveLength(2);
    expect(screen.getAllByText('Lifetime warranty')).toHaveLength(2);
  });

  it('renders children when items is not provided', () => {
    render(<Marquee>Ride safe</Marquee>);
    expect(screen.getAllByText('Ride safe')).toHaveLength(2);
  });

  it('marks the duplicate track as aria-hidden so screen readers only see it once', () => {
    const { container } = render(<Marquee items={['Free shipping']} />);
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    expect(hidden).toHaveLength(1);
  });
});
