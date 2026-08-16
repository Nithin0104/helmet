import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { render, screen } from '@testing-library/react';
import { WHY_US } from '../../../data/home';
import { WhyUs } from './WhyUs';

describe('WhyUs', () => {
  it('renders the heading and every trust card', () => {
    render(<WhyUs />);

    expect(screen.getByRole('heading', { name: /bought right/i })).toBeInTheDocument();
    for (const item of WHY_US) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<WhyUs />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
