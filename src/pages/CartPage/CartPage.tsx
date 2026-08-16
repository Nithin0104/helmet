import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs, EmptyState } from '../../components/primitives';
import {
  CartLineItem,
  FreeShipMeter,
  MobileCheckoutBar,
  OrderSummary,
  UndoToast,
} from '../../components/composite';
import { useCart } from '../../cart/CartContext';
import type { CartLine } from '../../cart/CartContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useInView } from '../../hooks/useInView';
import {
  buildSummaryRows,
  computeTotals,
  getSuggested,
  promoRate,
  toDisplayLine,
} from '../../lib/cart';
import { formatPrice } from '../../lib/format';
import { ACCESSORIES } from '../../data/accessories';
import { CART_TRUST, FREE_SHIP_THRESHOLD, PAY_METHODS, SUGGESTED_LIMIT } from '../../data/cart';
import { SavedForLater } from './sections/SavedForLater';
import { SuggestedRail } from './sections/SuggestedRail';
import styles from './CartPage.module.css';

/**
 * Shopping bag (`/cart`). Reads live `useCart()` state and composes the ported
 * DC cart: free-ship meter, line items, a sticky order summary with promo +
 * totals, saved-for-later, suggested add-ons, an empty state, undo-on-remove
 * and a mobile sticky checkout bar. Header/footer come from `SiteLayout`.
 */
export default function CartPage() {
  useDocumentTitle('Your bag', 'Review your APEXLINE bag and check out.');
  const navigate = useNavigate();
  const { lines, saved, subtotal, count, setQty, remove, clear, add, save, moveToBag, removeSaved } =
    useCart();

  const [promo, setPromo] = useState('');
  const [promoError, setPromoError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [undo, setUndo] = useState<{ msg: string; lines: CartLine[] } | null>(null);

  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [summaryRef, summaryInView] = useInView<HTMLDivElement>();

  useEffect(
    () => () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      if (checkoutTimer.current) clearTimeout(checkoutTimer.current);
    },
    [],
  );

  const isEmpty = lines.length === 0;
  const totals = useMemo(() => computeTotals(subtotal, promo), [subtotal, promo]);
  const summaryRows = useMemo(() => buildSummaryRows(totals, promo), [totals, promo]);
  const displayLines = useMemo(() => lines.map(toDisplayLine), [lines]);
  const displaySaved = useMemo(() => saved.map(toDisplayLine), [saved]);
  const suggested = useMemo(() => getSuggested(lines, ACCESSORIES, SUGGESTED_LIMIT), [lines]);

  const promoOk = totals.appliedRate > 0;
  const promoMessage = promoOk
    ? `Code ${promo} applied — ${Math.round(totals.appliedRate * 100)}% off`
    : promoError;

  const showUndo = (msg: string, removed: CartLine[]) => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndo({ msg, lines: removed });
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  };

  const handleRemove = (line: CartLine) => {
    remove(line.id);
    showUndo(`Removed ${line.name}`, [line]);
  };

  const handleClear = () => {
    const removed = lines;
    clear();
    setConfirmClear(false);
    showUndo('Bag cleared', removed);
  };

  const restoreUndo = () => {
    if (!undo) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undo.lines.forEach((l) =>
      add(
        { productId: l.productId, name: l.name, brand: l.brand, price: l.price, color: l.color, size: l.size },
        l.qty,
      ),
    );
    setUndo(null);
  };

  const applyPromo = (code: string) => {
    if (promoRate(code) > 0) {
      setPromo(code);
      setPromoError('');
    } else {
      setPromo('');
      setPromoError(code ? 'Invalid code — try RIDE10' : 'Enter a code');
    }
  };

  const checkout = () => {
    if (checkoutLoading || isEmpty) return;
    setCheckoutLoading(true);
    checkoutTimer.current = setTimeout(() => navigate('/checkout'), 400);
  };

  const totalLabel = formatPrice(totals.total);
  const checkoutLabel = checkoutLoading ? 'Processing' : `Checkout · ${totalLabel}`;
  const mobLabel = checkoutLoading ? 'Processing' : 'Checkout →';
  const barNote = totals.freeShipUnlocked
    ? 'Free delivery unlocked'
    : `Add ${formatPrice(totals.remainingForFreeShip)} for free delivery`;
  const showMobBar = !isEmpty && !summaryInView;

  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Your bag' }];

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />

      <div className={styles.wrap}>
        <Breadcrumbs
          items={crumbs}
          onNavigate={(href, e) => {
            e.preventDefault();
            navigate(href);
          }}
        />

        <div className={styles.titleRow}>
          <h1 className={styles.title}>Your bag</h1>
          <span className={styles.count}>
            {isEmpty ? '0 items' : `${count} ${count === 1 ? 'item' : 'items'}`}
          </span>
        </div>

        {isEmpty ? (
          <EmptyState
            variant="panel"
            title="Your bag is empty"
            body={
              saved.length
                ? 'Your saved items are safe below — move one back to the bag whenever you’re ready.'
                : 'Nothing in here yet. Explore the range and find your next lid.'
            }
            ctaLabel="Shop helmets"
            onCtaClick={() => navigate('/shop')}
          />
        ) : (
          <div className={styles.grid}>
            <div className={styles.col}>
              <FreeShipMeter
                subtotal={subtotal}
                threshold={FREE_SHIP_THRESHOLD}
                unlockedLabel="Free delivery unlocked"
              />

              <div className={styles.bagHead}>
                <span className={styles.bagEyebrow}>IN YOUR BAG</span>
                {confirmClear ? (
                  <span className={styles.confirm}>
                    <span className={styles.sure}>Sure?</span>
                    <button type="button" className={styles.dangerBtn} onClick={handleClear}>
                      YES
                    </button>
                    <button
                      type="button"
                      className={styles.subtleBtn}
                      onClick={() => setConfirmClear(false)}
                    >
                      NO
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.subtleBtn}
                    onClick={() => setConfirmClear(true)}
                  >
                    CLEAR ALL
                  </button>
                )}
              </div>

              {displayLines.map((line) => (
                <CartLineItem
                  key={line.id}
                  brand={line.brand}
                  model={line.model}
                  type={line.type}
                  color={line.color}
                  colorHex={line.colorHex}
                  size={line.sizeLabel}
                  price={line.price}
                  qty={line.qty}
                  stock={line.stock}
                  eta={line.eta}
                  onQtyChange={(q) => setQty(line.id, q)}
                  onSave={() => save(line.id)}
                  onRemove={() => handleRemove(line)}
                />
              ))}

              <button type="button" className={styles.backLink} onClick={() => navigate('/shop')}>
                ← Continue shopping
              </button>
            </div>

            <div className={styles.summary} ref={summaryRef}>
              <OrderSummary
                rows={summaryRows}
                total={totalLabel}
                totalNote="Incl. GST · India"
                checkoutLabel={checkoutLabel}
                loading={checkoutLoading}
                promoMessage={promoMessage}
                promoOk={promoOk}
                payMethods={PAY_METHODS}
                trust={CART_TRUST}
                onApplyPromo={applyPromo}
                onCheckout={checkout}
              />
            </div>
          </div>
        )}

        <SavedForLater items={displaySaved} onMoveToBag={moveToBag} onRemove={removeSaved} />

        <SuggestedRail
          items={suggested}
          onAdd={(p) => add({ productId: p.id, name: p.name, brand: p.brand, price: p.price })}
        />
      </div>

      {showMobBar && (
        <div className={styles.mobBar}>
          <MobileCheckoutBar
            total={totalLabel}
            itemCount={count}
            label={mobLabel}
            note={barNote}
            noteTone={totals.freeShipUnlocked ? 'good' : 'muted'}
            rows={summaryRows}
            loading={checkoutLoading}
            onCheckout={checkout}
          />
        </div>
      )}

      {undo && (
        <div className={styles.undoWrap}>
          <UndoToast open message={undo.msg} onAction={restoreUndo} />
        </div>
      )}
    </div>
  );
}
