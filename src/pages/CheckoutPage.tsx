import PageShell from './PageShell';

/**
 * Checkout page (minimal layout). Phase 3 routing scaffold — the multi-section
 * contact/shipping/payment form, order summary, step ProgressBar, and
 * place-order → success → clear() flow are built on top of this shell in the
 * CheckoutPage step.
 */
export default function CheckoutPage() {
  return <PageShell eyebrow="CHECKOUT" title="Secure checkout" />;
}
