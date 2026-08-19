import { CartItem } from "@/types/cart";
import { stores } from "@/lib/data/stores";

export type StoreTotal = {
  storeId: number;
  storeName: string;
  total: number;
};

type PriceData = {
  productId: number;
  storeId: number;
  price: number;
  currency: string;
  source: string;
  updatedAt: string;
  regularPrice: number | null;
  promoPrice: number | null;
};

export function calculateTotals(
  cart: CartItem[],
  selectedStoreIds: number[],
  prices: PriceData[]
): StoreTotal[] {
  const totals = stores
    .filter((store) => selectedStoreIds.includes(store.id))
    .map((store) => {
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