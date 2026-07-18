import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('text variant renders the requested number of lines, hidden from screen readers', () => {
    const { container } = render(<Skeleton variant="text" lines={4} />);
    expect(container.firstChild).toHaveAttribute('aria-hidden');
    expect(container.querySelectorAll('span > span')).toHaveLength(4);
  });

  it('defaults to 3 lines', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelectorAll('span > span')).toHaveLength(3);
  });

  it('circle renders a single hidden element', () => {
    const { container } = render(<Skeleton circle width={40} />);
    expect(container.firstChild).toHaveAttribute('aria-hidden');
    expect(container.querySelectorAll('span')).toHaveLength(1);
  });

  it('card/block variants render a single hidden placeholder', () => {
    const { container } = render(<Skeleton variant="card" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden');
  });
});
