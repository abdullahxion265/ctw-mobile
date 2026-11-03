import { useState, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { hapticSuccess, hapticWarning } from '../utils/haptics';
import { MAX_QTY, MAX_LINES } from '../utils/cart';
import ConfirmModal from '../components/ConfirmModal';

/**
 * The "+" button on a product card: add one to the cart without opening
 * the product. Returns quickAdd(product) -> true when something was added,
 * and a modal element for the screen to render once; the modal only shows
 * when the cart limits (20 per item, 25 different items) stop the add.
 */
export function useQuickAdd() {
  const { addItem } = useCart();
  const [limit, setLimit] = useState(null);

  const quickAdd = useCallback(
    (product) => {
      const result = addItem(product, 1);
      if (result === 'added' || result === 'increased') {
        hapticSuccess();
        return true;
      }
      hapticWarning();
      setLimit(
        result === 'max_qty'
          ? `You can order up to ${MAX_QTY} of one item.`
          : `Your cart is full (${MAX_LINES} different items). Remove one to add another.`
      );
      return false;
    },
    [addItem]
  );

  const quickAddModal = (
    <ConfirmModal
      visible={!!limit}
      title="Cart limit"
      message={limit || ''}
      confirmLabel="OK"
      danger={false}
      single
      onConfirm={() => setLimit(null)}
      onCancel={() => setLimit(null)}
    />
  );

  return { quickAdd, quickAddModal };
}
