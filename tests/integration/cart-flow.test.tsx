import { describe, expect, it } from 'vitest';
import { useCart } from '../../src/cart/CartContext';
import { renderWithProviders, screen, userEvent } from '../utils';

function CartConsumer() {
  const { lines, count, subtotal, add, setQty, clear } = useCart();
  return (
    <div>
      <p data-testid="count">{count}</p>
      <p data-testid="subtotal">{subtotal}</p>
      <button
        onClick={() =>
          add({
            productId: 'velocity-rs-carbon',
            name: 'Velocity RS Carbon',
            brand: 'Apexline',
            price: 42999,
          })
        }
      >
        Add to cart
      </button>
      <ul>
        {lines.map((line) => (
          <li key={line.id}>
            {line.name} × {line.qty}
            <button aria-label={`Remove ${line.name}`} onClick={() => setQty(line.id, 0)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => clear()}>Clear cart</button>
    </div>
  );
}

describe('cart flow integration', () => {
  it('add-to-cart increments the count and subtotal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartConsumer />);

    expect(screen.getByTestId('count')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'Add to cart' }));

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('subtotal')).toHaveTextContent('42999');
    expect(screen.getByRole('listitem')).toHaveTextContent('Velocity RS Carbon');
  });

  it('adding the same line twice merges quantity instead of duplicating the row', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartConsumer />);

    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('setQty(0) via a remove control removes the line and count returns to 0', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartConsumer />);

    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    await user.click(screen.getByRole('button', { name: /remove velocity rs carbon/i }));

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('clear empties the cart', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartConsumer />);

    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    await user.click(screen.getByRole('button', { name: 'Clear cart' }));

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('hydrates from an initialCart fixture passed to renderWithProviders', () => {
    renderWithProviders(<CartConsumer />, {
      initialCart: [
        {
          id: 'p1|black|m',
          productId: 'p1',
          name: 'Fixture Helmet',
          brand: 'Apexline',
          price: 10000,
          color: 'black',
          size: 'm',
          qty: 2,
        },
      ],
    });

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByRole('listitem')).toHaveTextContent('Fixture Helmet');
  });
});
