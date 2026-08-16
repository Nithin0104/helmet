import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders a status role with an accessible label', () => {
    render(<Spinner label="Loading products" />);
    expect(screen.getByRole('status', { name: 'Loading products' })).toBeInTheDocument();
  });

  it('defaults to a "Loading" label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Spinner />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
