import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('exposes value via role=progressbar aria-value*', () => {
    render(<ProgressBar value={40} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps values above 100 and below 0', () => {
    const { rerender } = render(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    rerender(<ProgressBar value={-20} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('indeterminate omits aria-valuenow', () => {
    render(<ProgressBar indeterminate />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('renders a percentage label when showLabel is set', () => {
    render(<ProgressBar value={67} showLabel />);
    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<ProgressBar value={40} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
