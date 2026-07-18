import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ColorSwatch } from './ColorSwatch';
import type { SwatchOption } from './ColorSwatch';

const colors: SwatchOption[] = [
  { value: 'matte-black', hex: '#1a1a1c', name: 'Matte Black' },
  { value: 'racing-red', hex: '#c0392b', name: 'Racing Red' },
  { value: 'pearl-white', hex: '#f4f3f1', name: 'Pearl White', disabled: true },
];

describe('ColorSwatch', () => {
  it('renders a radiogroup with the first color selected by default (uncontrolled)', () => {
    render(<ColorSwatch colors={colors} label="Colour" />);
    expect(screen.getByRole('radiogroup', { name: 'Colour' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Matte Black' })).toHaveAttribute('aria-checked', 'true');
  });

  it('selecting a swatch updates the uncontrolled selection', async () => {
    const user = userEvent.setup();
    render(<ColorSwatch colors={colors} />);

    await user.click(screen.getByRole('radio', { name: 'Racing Red' }));

    expect(screen.getByRole('radio', { name: 'Racing Red' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Matte Black' })).toHaveAttribute('aria-checked', 'false');
  });

  it('is controlled when value is provided', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorSwatch colors={colors} value="matte-black" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'Racing Red' }));

    expect(onChange).toHaveBeenCalledWith('racing-red');
    expect(screen.getByRole('radio', { name: 'Matte Black' })).toHaveAttribute('aria-checked', 'true');
  });

  it('disabled options cannot be selected', async () => {
    const user = userEvent.setup();
    render(<ColorSwatch colors={colors} />);

    const disabledOption = screen.getByRole('radio', { name: 'Pearl White' });
    expect(disabledOption).toBeDisabled();

    await user.click(disabledOption);
    expect(disabledOption).toHaveAttribute('aria-checked', 'false');
  });

  it('renders an empty swatch list without crashing', () => {
    render(<ColorSwatch colors={[]} />);
    expect(screen.getByRole('radiogroup')).toBeEmptyDOMElement();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<ColorSwatch colors={colors} label="Colour" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
