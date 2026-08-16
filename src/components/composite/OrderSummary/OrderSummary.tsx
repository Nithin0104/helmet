import { useState } from 'react';
import type { CSSProperties } from 'react';
import { cx } from '../../../lib/cx';
import { TextInput } from '../../primitives/TextInput/TextInput';
import { TrustList } from '../../primitives/TrustList/TrustList';
import type { TrustListItem } from '../../primitives/TrustList/TrustList';
import type { SummaryRow } from '../../../lib/cart';
import styles from './OrderSummary.module.css';

export interface OrderSummaryProps {
  heading?: string;
  /** Labelled money rows (subtotal / discount / delivery / tax). */
  rows: SummaryRow[];
  /** Pre-formatted grand total, e.g. `₹1,424`. */
  total: string;
  totalNote?: string;
  /** Checkout button label. */
  checkoutLabel: string;
  loading?: boolean;
  /** Promo feedback message under the input. */
  promoMessage?: string;
  /** Whether `promoMessage` reads as success (green) or error (red). */
  promoOk?: boolean;
  /** Show the promo code affordance. @default true */
  showPromo?: boolean;
  /** Start the promo input collapsed behind a toggle. @default true */
  promoCollapsible?: boolean;
  payMethods?: string[];
  trust?: TrustListItem[];
  /** Render the checkout button. @default true */
  showCheckout?: boolean;
  onApplyPromo?: (code: string) => void;
  onCheckout?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Order summary card: collapsible promo input, money rows, grand total, checkout
 * CTA, accepted-payment chips and trust badges. Ports the DC `OrderSummary`;
 * promo input reuses `TextInput` and trust badges reuse `TrustList`.
 */
export function OrderSummary({
  heading = 'ORDER SUMMARY',
  rows,
  total,
  totalNote = 'Incl. GST',
  checkoutLabel,
  loading = false,
  promoMessage,
  promoOk = false,
  showPromo = true,
  promoCollapsible = true,
  payMethods,
  trust,
  showCheckout = true,
  onApplyPromo,
  onCheckout,
  className,
  style,
}: OrderSummaryProps) {
  const [code, setCode] = useState('');
  const [openOverride, setOpenOverride] = useState<boolean | null>(null);
  const open = openOverride ?? !promoCollapsible;

  const apply = () => {
    onApplyPromo?.(code.trim().toUpperCase());
    setCode('');
  };

  return (
    <div className={cx(styles.panel, className)} style={style}>
      <div className={styles.heading}>{heading}</div>

      {showPromo && (
        <div className={styles.promo}>
          {promoCollapsible && !open ? (
            <button
              type="button"
              className={styles.promoToggle}
              aria-expanded={false}
              onClick={() => setOpenOverride(true)}
            >
              <span>Have a promo code?</span>
              <span className={styles.promoPlus}>+</span>
            </button>
          ) : (
            <div className={styles.promoRow}>
              <TextInput
                className={styles.promoInput}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') apply();
                }}
                placeholder="Promo code"
                aria-label="Promo code"
                style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
              />
              <button type="button" className={styles.applyBtn} onClick={apply}>
                APPLY
              </button>
            </div>
          )}
          {promoMessage && (
            <div className={cx(styles.promoMsg, promoOk ? styles.promoOk : styles.promoErr)}>
              {promoMessage}
            </div>
          )}
        </div>
      )}

      <div className={styles.rows}>
        {rows.map((r, i) => (
          <div className={styles.row} key={`${r.label}-${i}`}>
            <span className={styles.rowLabel}>{r.label}</span>
            <span className={cx(styles.rowValue, r.tone && styles[`tone_${r.tone}`])}>{r.value}</span>
          </div>
        ))}
      </div>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <div className={styles.totalCol}>
          <span className={styles.totalValue}>{total}</span>
          <div className={styles.totalNote}>{totalNote}</div>
        </div>
      </div>

      {showCheckout && (
        <button
          type="button"
          className={styles.checkout}
          onClick={onCheckout}
          disabled={loading}
          aria-busy={loading || undefined}
        >
          {loading && <span className={styles.spinner} aria-hidden />}
          {checkoutLabel}
        </button>
      )}

      {payMethods && payMethods.length > 0 && (
        <div className={styles.pay}>
          {payMethods.map((pm) => (
            <span className={styles.payChip} key={pm}>
              {pm}
            </span>
          ))}
        </div>
      )}

      {trust && trust.length > 0 && <TrustList className={styles.trust} items={trust} />}
    </div>
  );
}
