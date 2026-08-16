import type { CSSProperties } from 'react';
import { Heart, Trash2, Undo2 } from 'lucide-react';
import { cx } from '../../../lib/cx';
import { formatPrice } from '../../../lib/format';
import { Icon } from '../../primitives/Icon/Icon';
import { QtyStepper } from '../../primitives/QtyStepper/QtyStepper';
import styles from './CartLineItem.module.css';

export interface CartLineItemProps {
  brand: string;
  /** Product / model name. */
  model: string;
  /** Category label shown on the image tile, e.g. `HELMET`. @default 'ITEM' */
  type?: string;
  /** Colour name for the chip. */
  color?: string;
  /** Swatch hex for the colour dot. */
  colorHex?: string;
  /** Short size label, e.g. `M` or `One size`. */
  size?: string;
  /** Unit price in rupees. */
  price: number;
  qty: number;
  /** Units in stock — drives the stock line and the qty ceiling. */
  stock?: number;
  /** Delivery estimate copy (hidden in the saved variant). */
  eta?: string;
  /** Saved-for-later variant: hides the stepper/ETA, flips Save → "Move to bag". */
  saved?: boolean;
  /** Show the save / move-to-bag action. @default true */
  showSave?: boolean;
  onQtyChange?: (qty: number) => void;
  onRemove?: () => void;
  onSave?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * A single row in the shopping bag (or the saved-for-later list): thumbnail,
 * brand/model, colour + size chips, stock line, ETA, a quantity stepper and
 * save/remove actions. Ports the DC `CartLineItem`; the qty control reuses the
 * design-system `QtyStepper` and the icon buttons are real, labelled buttons.
 */
export function CartLineItem({
  brand,
  model,
  type = 'ITEM',
  color,
  colorHex,
  size,
  price,
  qty,
  stock,
  eta,
  saved = false,
  showSave = true,
  onQtyChange,
  onRemove,
  onSave,
  className,
  style,
}: CartLineItemProps) {
  const oos = stock === 0;
  const low = stock != null && stock > 0 && stock <= 3;
  const interactive = !saved;
  const max = stock != null && stock > 0 ? stock : 99;

  const stockLabel = oos ? 'Out of stock' : low ? `Only ${stock} left` : 'In stock';
  const saveLabel = saved ? 'Move to bag' : 'Save for later';
  const sizeText = size ? (/^\d|one/i.test(size) && size.length > 2 ? size : `Size ${size}`) : '';
  const lineTotal = formatPrice(price * (saved ? 1 : qty));

  return (
    <div className={cx(styles.root, saved && styles.savedRow, className)} style={style}>
      <div className={styles.media} aria-hidden>
        <span className={styles.mediaTag}>[ {type} ]</span>
      </div>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <div className={styles.titleCol}>
            <div className={styles.brand}>{brand}</div>
            <div className={styles.model}>{model}</div>
          </div>
          <div className={styles.lineTotal}>{lineTotal}</div>
        </div>

        {(color || size) && (
          <div className={styles.chips}>
            {color && (
              <span className={styles.chip}>
                <span className={styles.dot} style={{ background: colorHex ?? 'var(--text-dim)' }} />
                {color}
              </span>
            )}
            {size && <span className={styles.chip}>{sizeText}</span>}
          </div>
        )}

        <div className={cx(styles.stock, oos ? styles.stockOut : low ? styles.stockLow : styles.stockOk)}>
          {stockLabel}
        </div>

        {!saved && eta && <div className={styles.eta}>{eta}</div>}

        <div className={styles.foot}>
          {interactive && (
            <QtyStepper
              value={qty}
              min={1}
              max={max}
              size="sm"
              disabled={oos}
              onChange={(v) => onQtyChange?.(v)}
            />
          )}
          <div className={styles.acts}>
            {showSave && (
              <button
                type="button"
                className={styles.iconBtn}
                aria-label={saveLabel}
                data-tip={saveLabel}
                onClick={onSave}
              >
                <Icon icon={saved ? Undo2 : Heart} size={17} />
              </button>
            )}
            <button
              type="button"
              className={cx(styles.iconBtn, styles.danger)}
              aria-label="Remove"
              data-tip="Remove"
              onClick={onRemove}
            >
              <Icon icon={Trash2} size={17} />
            </button>
          </div>
        </div>

        {!saved && qty > 1 && <div className={styles.unit}>{formatPrice(price)} each</div>}
      </div>
    </div>
  );
}
