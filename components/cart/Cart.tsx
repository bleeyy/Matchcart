import { CartItem as CartItemType } from "@/types/cart";
import CartItem from "./CartItem";

import EmptyCart from "./EmptyCart";

type CartProps = {
  cart: CartItemType[];
  removeItem: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  highlightedItem: number | null;
};

export default function Cart({
  cart,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  highlightedItem,
}: CartProps) {
  return (
    <>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-[-0.03em] text-[#243239]">
            Your list
          </h2>

          <p className="text-sm text-[#68736f]">
            {cart.length} {cart.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>
      {cart.length === 0 ? (
        <EmptyCart
          onStartShopping={() => {
            document
              .querySelector<HTMLInputElement>('input[placeholder="Search products..."]')
              ?.focus();
          }}
        />
      ) : (<ul className="space-y-3">
        {cart.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            removeItem={removeItem}
            increaseQuantity={increaseQuantity}
            decreaseQuantity={decreaseQuantity}
            highlighted={highlightedItem === item.id}
          />
        ))}
      </ul>
      )}
    </>
  );
}