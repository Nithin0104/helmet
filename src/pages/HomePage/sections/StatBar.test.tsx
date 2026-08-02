import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { render, screen } from '@testing-library/react';
import { STATS } from '../../../data/home';
import { StatBar } from './StatBar';

describe('StatBar', () => {
  it('renders one stat per STATS entry with its label', () => {
    render(<StatBar />);
    for (const stat of STATS) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    }
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<StatBar />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
