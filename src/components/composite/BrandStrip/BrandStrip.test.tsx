import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { BrandStrip } from './BrandStrip';

describe('BrandStrip', () => {
  it('renders the caption label', () => {
    render(<BrandStrip label="OUR BRANDS" brands={['APEX']} />);
    expect(screen.getByText('OUR BRANDS')).toBeInTheDocument();
  });

  it('renders each brand (duplicated for the seamless loop)', () => {
    render(<BrandStrip brands={['APEX', 'STRATA']} />);
    expect(screen.getAllByText('APEX')).toHaveLength(2);
    expect(screen.getAllByText('STRATA')).toHaveLength(2);
  });

  it('hides the caption when label is empty and stays labelled for a11y', () => {
    render(<BrandStrip label="" brands={['APEX']} />);
    expect(screen.getByRole('region', { name: 'Stocked brands' })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<BrandStrip brands={['APEX', 'STRATA']} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
