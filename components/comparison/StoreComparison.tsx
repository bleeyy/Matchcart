import { CartItem } from "@/types/cart";
import { stores } from "@/lib/data/stores";
import { prices } from "@/lib/data/prices";
import { products } from "@/lib/data/products";

type StoreComparisonProps = {
  cart: CartItem[];
};

export default function StoreComparison({
  cart,
}: StoreComparisonProps) {

  const storeTotals = stores.map((store) => {
    let total = 0;

    cart.forEach((cartItem) => {
      const productPrice = prices.find(
        (price) =>
          price.productId === cartItem.productId &&
          price.storeId === store.id
      );

      if (productPrice) {
        total += productPrice.price * cartItem.quantity;
      }
    });

    return {
      storeName: store.name,
      total,
    };
  });

  const cheapestTotal = Math.min(
    ...storeTotals.map((store) => store.total)
  );

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-black mb-3">
        Store Comparison
      </h2>

      <div className="space-y-2">
        {storeTotals.map((store) => (
          <div
            key={store.storeName}
            className={`flex justify-between border rounded-lg p-3 ${store.total === cheapestTotal
                ? "border-green-500 bg-green-50"
                : ""
              }`}
          >
            <span className="text-black">
              {store.storeName}
            </span>

            <span className="font-bold text-black">
              ${store.total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}