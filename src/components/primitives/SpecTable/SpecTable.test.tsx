import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SpecTable } from './SpecTable';

describe('SpecTable', () => {
  it('renders label/value pairs from objects', () => {
    render(
      <SpecTable
        items={[
          { label: 'Shell', value: 'Carbon fibre' },
          { label: 'Weight', value: '1,350g' },
        ]}
      />,
    );
    expect(screen.getByText('Shell')).toBeInTheDocument();
    expect(screen.getByText('Carbon fibre')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
  });

  it('accepts [label, value] tuple rows', () => {
    render(<SpecTable items={[['Certification', 'ISI, ECE 22.06']]} />);
    expect(screen.getByText('Certification')).toBeInTheDocument();
    expect(screen.getByText('ISI, ECE 22.06')).toBeInTheDocument();
  });

  it('renders as a semantic definition list', () => {
    const { container } = render(<SpecTable items={[{ label: 'A', value: 'B' }]} />);
    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(container.querySelector('dt')?.textContent).toBe('A');
    expect(container.querySelector('dd')?.textContent).toBe('B');
  });

  it('renders nothing but an empty list when given no rows', () => {
    const { container } = render(<SpecTable items={[]} />);
    expect(container.querySelectorAll('dt')).toHaveLength(0);
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <SpecTable items={[{ label: 'Shell', value: 'Carbon' }, { label: 'Weight', value: '1,350g' }]} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
