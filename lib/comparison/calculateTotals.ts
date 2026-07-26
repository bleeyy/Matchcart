import { CartItem } from "@/types/cart";
import { prices } from "@/lib/data/prices";
import { stores } from "@/lib/data/stores";

export type StoreTotal = {
  storeId: number;
  storeName: string;
  total: number;
};

export function calculateTotals(cart: CartItem[]): StoreTotal[] {
  const totals = stores.map((store) => {

      let total = 0;

      cart.forEach((item) => {
          const productPrice = prices.find(
              (price) =>
                  price.productId === item.productId &&
                  price.storeId === store.id
          );

          if (productPrice) {
              total += productPrice.price * item.quantity;
          }
      });

    return {
      storeId: store.id,
      storeName: store.name,
      total,
    };
  });

  return totals.sort((a, b) => a.total - b.total);

}