import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { BrandStrip } from './BrandStrip';

describe('BrandStrip', () => {
  it('renders the caption label', () => {
    render(<BrandStrip label="OUR BRANDS" brands={['APEX']} />);
    expect(screen.getByText('OUR BRANDS')).toBeInTheDocument();
  });

  it('renders each brand (duplicated for the seamless loop)', () => {
    render(<BrandStrip brands={['APEX', 'STRATA']} />);
    // Scoped to the visible track — a separate, always-one-copy hidden row
    // exists purely to measure width against the viewport (see next test) and
    // would otherwise add an extra match per brand.
    const track = within(screen.getByTestId('brand-track'));
    expect(track.getAllByText('APEX')).toHaveLength(2);
    expect(track.getAllByText('STRATA')).toHaveLength(2);
  });

  it('repeats the brand list enough to cover a viewport wider than one set', () => {
    // jsdom never lays elements out (widths are always 0), so the measured-repeat
    // effect no-ops and this can't be exercised through real layout. Stub the two
    // measurements it reads: a 100px single set inside a 1000px-wide viewport,
    // which needs 11 copies per half to clear the right-edge gap this covers.
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);

    render(<BrandStrip brands={['APEX', 'STRATA']} />);
    const track = within(screen.getByTestId('brand-track'));

    // 2 halves x 11 copies x 1 occurrence of APEX per copy = 22.
    expect(track.getAllByText('APEX')).toHaveLength(22);
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
