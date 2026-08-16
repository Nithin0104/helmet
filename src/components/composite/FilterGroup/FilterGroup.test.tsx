import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { FilterGroup } from './FilterGroup';

const BRANDS = [
  { value: 'apex', label: 'APEX', count: 12 },
  { value: 'strata', label: 'STRATA', count: 9 },
  { value: 'nordvik', label: 'NORDVIK', count: 7 },
];

describe('FilterGroup', () => {
  it('renders a labelled group of checkbox options with counts', () => {
    render(<FilterGroup title="BRAND" options={BRANDS} searchable={false} />);
    expect(screen.getByRole('group', { name: 'BRAND' })).toBeInTheDocument();
    const apex = screen.getByRole('checkbox', { name: /APEX/ });
    expect(apex).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('toggles options in multi mode (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterGroup title="BRAND" options={BRANDS} searchable={false} onChange={onChange} />);

    await user.click(screen.getByRole('checkbox', { name: /APEX/ }));
    expect(onChange).toHaveBeenLastCalledWith(['apex']);
    await user.click(screen.getByRole('checkbox', { name: /STRATA/ }));
    expect(onChange).toHaveBeenLastCalledWith(['apex', 'strata']);
    await user.click(screen.getByRole('checkbox', { name: /APEX/ }));
    expect(onChange).toHaveBeenLastCalledWith(['strata']);
  });

  it('single mode replaces the selection and uses radio semantics', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterGroup title="BRAND" mode="single" options={BRANDS} searchable={false} onChange={onChange} />);

    expect(screen.getByRole('radiogroup', { name: 'BRAND' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /APEX/ }));
    expect(onChange).toHaveBeenLastCalledWith(['apex']);
    await user.click(screen.getByRole('radio', { name: /STRATA/ }));
    expect(onChange).toHaveBeenLastCalledWith(['strata']);
  });

  it('is controlled by value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterGroup title="BRAND" options={BRANDS} value={['apex']} onChange={onChange} searchable={false} />,
    );
    expect(screen.getByRole('checkbox', { name: /APEX/ })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('checkbox', { name: /STRATA/ }));
    expect(onChange).toHaveBeenLastCalledWith(['apex', 'strata']);
    // still controlled: STRATA not visually checked
    expect(screen.getByRole('checkbox', { name: /STRATA/ })).toHaveAttribute('aria-checked', 'false');
  });

  it('filters options by search and shows a no-match message', async () => {
    const user = userEvent.setup();
    render(<FilterGroup title="BRAND" options={BRANDS} />);

    const search = screen.getByRole('textbox', { name: 'Search BRAND' });
    await user.type(search, 'nord');
    expect(screen.getByRole('checkbox', { name: /NORDVIK/ })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /APEX/ })).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'zzz');
    expect(screen.getByText(/Nothing matches/)).toBeInTheDocument();
  });

  it('collapses and expands when collapsible', async () => {
    const user = userEvent.setup();
    render(<FilterGroup title="BRAND" options={BRANDS} collapsible searchable={false} />);

    const head = screen.getByRole('button', { expanded: true });
    await user.click(head);
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /APEX/ })).not.toBeInTheDocument();
  });

  it('starts collapsed with defaultOpen={false} and opens on click', async () => {
    const user = userEvent.setup();
    render(<FilterGroup title="BRAND" options={BRANDS} collapsible defaultOpen={false} searchable={false} />);

    const head = screen.getByRole('button', { expanded: false });
    expect(screen.queryByRole('checkbox', { name: /APEX/ })).not.toBeInTheDocument();
    await user.click(head);
    expect(screen.getByRole('checkbox', { name: /APEX/ })).toBeInTheDocument();
  });

  it('renders a titleNote scope hint in the header', () => {
    render(<FilterGroup title="BRAND" titleNote="IN 2 CATEGORIES" options={BRANDS} searchable={false} />);
    expect(screen.getByText('IN 2 CATEGORIES')).toBeInTheDocument();
  });

  it('renders swatch options with an accessible name', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterGroup
        title="COLOUR"
        variant="swatch"
        searchable={false}
        onChange={onChange}
        options={[
          { value: 'black', label: 'Black', hex: '#14141a' },
          { value: 'red', label: 'Red', hex: '#c0392b' },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Red' }));
    expect(onChange).toHaveBeenLastCalledWith(['red']);
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<FilterGroup title="BRAND" options={BRANDS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
