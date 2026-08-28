import { CartItem } from "@/types/cart";
import { stores } from "@/lib/data/stores";
import type { MatchCartPrice } from "@/lib/data/priceRepository";

export type StoreTotal = {
  storeId: number;
  storeName: string;
  total: number;
  missingItems: number;
};

export function calculateTotals(
  cart: CartItem[],
  selectedStoreIds: number[],
  prices: MatchCartPrice[]
): StoreTotal[] {
  const totals = stores
    .filter((store) => selectedStoreIds.includes(store.id))
    .map((store) => {
      let total = 0;
      let missingItems = 0;

      for (const item of cart) {
        /*
         * First try to find an exact match:
         *
         * store + product + variant + size
         */
        let productPrice = prices.find(
          (price) =>
            price.storeId === store.id &&
            price.productId === item.productId &&
            price.variantId === (item.variantId ?? null) &&
            price.sizeId === (item.sizeId ?? null)
        );

        /*
         * If the exact variant/size combination
         * isn't available, allow a product-level
         * price as a fallback.
         *
         * This is useful for products that don't
         * have variants or sizes.
         */
        if (!productPrice) {
          productPrice = prices.find(
            (price) =>
              price.storeId === store.id &&
              price.productId === item.productId &&
              price.variantId == null &&
              price.sizeId == null
          );
        }

        /*
         * No price means the store doesn't
         * currently have a matching price in
         * Supabase.
         */
        if (!productPrice) {
          missingItems += 1;
          continue;
        }

        total += productPrice.price * item.quantity;
      }

      return {
        storeId: store.id,
        storeName: store.name,
        total,
        missingItems,
      };
    });

  /*
   * Ranking:
   *
   * 1. Stores with all items available
   * 2. Fewer missing items
   * 3. Lower total price
   */
  return totals.sort((a, b) => {
    const aComplete = a.missingItems === 0;
    const bComplete = b.missingItems === 0;

    if (aComplete && !bComplete) {
      return -1;
    }
    if (!aComplete && bComplete) {
      return 1;
    }
    if (a.missingItems !== b.missingItems) {
      return a.missingItems - b.missingItems;
    }

    return a.total - b.total;
  });
}