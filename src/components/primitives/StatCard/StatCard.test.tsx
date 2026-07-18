import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders the label and a synchronously formatted value when countUp is off', () => {
    render(<StatCard value={128} label="Reviews" countUp={false} />);
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
  });

  it('applies prefix/suffix to the synchronous value', () => {
    render(<StatCard value={4.7} label="Rating" countUp={false} suffix="/5" />);
    expect(screen.getByText('4.7/5')).toBeInTheDocument();
  });

  it('renders delta with a trend indicator when provided', () => {
    render(<StatCard value={128} label="Reviews" countUp={false} delta="+12%" trend="up" />);
    expect(screen.getByText(/\+12%/)).toBeInTheDocument();
  });

  it('omits the delta row entirely when delta is not provided', () => {
    render(<StatCard value={128} label="Reviews" countUp={false} />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<StatCard value={128} label="Reviews" countUp={false} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
