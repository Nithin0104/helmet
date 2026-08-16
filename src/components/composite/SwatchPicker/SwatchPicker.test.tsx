import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { SwatchPicker, type SwatchPickerItem } from './SwatchPicker';

const ITEMS: SwatchPickerItem[] = [
  { name: 'Matte Black', hex: '#1a1a1c' },
  { name: 'Racing Red', hex: '#c0392b' },
  { name: 'Pearl White', hex: '#f4f3f1' },
];

describe('SwatchPicker', () => {
  it('renders a radiogroup with a labelled radio per colour', () => {
    render(<SwatchPicker items={ITEMS} label="Colour" />);
    expect(screen.getByRole('radiogroup', { name: 'Colour' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Matte Black' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Racing Red' })).toBeInTheDocument();
  });

  it('shows the selected colour name in the header', () => {
    render(<SwatchPicker items={ITEMS} defaultValue={1} />);
    expect(screen.getByText('Racing Red')).toBeInTheDocument();
  });

  it('is uncontrolled by default and updates the selected name on click', async () => {
    const user = userEvent.setup();
    render(<SwatchPicker items={ITEMS} />);
    await user.click(screen.getByRole('radio', { name: 'Pearl White' }));
    expect(screen.getByRole('radio', { name: 'Pearl White' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByText('Pearl White')).toBeInTheDocument();
  });

  it('is controlled when value is provided', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SwatchPicker items={ITEMS} value={0} onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: 'Racing Red' }));
    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.getByRole('radio', { name: 'Matte Black' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('does not select a disabled swatch', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SwatchPicker
        items={[{ name: 'Matte Black', hex: '#1a1a1c' }, { name: 'Gone', hex: '#333', disabled: true }]}
        value={0}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('radio', { name: 'Gone' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<SwatchPicker items={ITEMS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
