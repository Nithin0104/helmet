import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Select } from './Select';

const OPTIONS = ['Featured', 'Price low→high', 'Price high→low', 'Newest'];

describe('Select', () => {
  it('renders the first option as the value by default and exposes listbox semantics', () => {
    render(<Select options={OPTIONS} label="Sort:" />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveTextContent('Featured');
  });

  it('opens on click and selects an option (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={OPTIONS} onChange={onChange} />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Newest' }));

    expect(onChange).toHaveBeenCalledWith('Newest');
    expect(screen.getByRole('button')).toHaveTextContent('Newest');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('is controlled by value and does not self-update', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={OPTIONS} value="Featured" onChange={onChange} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('option', { name: 'Newest' }));

    expect(onChange).toHaveBeenCalledWith('Newest');
    // value prop still "Featured" — controlled parent hasn't changed it
    expect(screen.getByRole('button')).toHaveTextContent('Featured');
  });

  it('navigates with the keyboard and selects with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={OPTIONS} onChange={onChange} />);

    const trigger = screen.getByRole('button');
    trigger.focus();
    await user.keyboard('{ArrowDown}'); // opens, active = selected (index 0)
    await user.keyboard('{ArrowDown}'); // -> index 1
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('Price low→high');
  });

  it('Escape closes the panel and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Select options={OPTIONS} />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('keyboard navigation skips disabled options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Bravo', disabled: true },
          { value: 'c', label: 'Charlie' },
        ]}
        onChange={onChange}
      />,
    );

    screen.getByRole('button').focus();
    await user.keyboard('{ArrowDown}'); // opens, active = index 0 (Alpha)
    await user.keyboard('{ArrowDown}'); // steps past disabled Bravo -> Charlie
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('does not select a disabled option on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Bravo', disabled: true },
        ]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button'));
    const bravo = screen.getByRole('option', { name: 'Bravo' });
    expect(bravo).toBeDisabled();
    await user.click(bravo);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes on outside click', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Select options={OPTIONS} />
        <button type="button">outside</button>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: /featured/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Select options={OPTIONS} label="Sort:" aria-label="Sort products" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
