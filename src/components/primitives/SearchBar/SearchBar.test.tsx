import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders a search role with a placeholder', () => {
    render(<SearchBar placeholder="Search helmets…" />);
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search helmets…')).toBeInTheDocument();
  });

  it('typing updates the uncontrolled value', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    const input = screen.getByRole('searchbox');

    await user.type(input, 'carbon');

    expect(input).toHaveValue('carbon');
  });

  it('is controlled when value is provided', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar value="c" onChange={onChange} />);
    const input = screen.getByRole('searchbox');

    await user.type(input, 'x');

    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue('c');
  });

  it('submits the current value via onSubmit and prevents default form navigation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SearchBar defaultValue="carbon" onSubmit={onSubmit} />);

    await user.type(screen.getByRole('searchbox'), '{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('carbon');
  });

  it('shows a clear button only once there is text, and it clears the value', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<SearchBar defaultValue="carbon" onClear={onClear} />);

    const clearBtn = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clearBtn);

    expect(onClear).toHaveBeenCalled();
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('hides the clear button while loading even with text present', () => {
    render(<SearchBar defaultValue="carbon" loading />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  it('disables the input when disabled is set', () => {
    render(<SearchBar disabled />);
    expect(screen.getByRole('searchbox')).toBeDisabled();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<SearchBar defaultValue="carbon" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
