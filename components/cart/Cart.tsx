import { CartItem as CartItemType } from "@/types/cart";
import CartItem from "./CartItem";

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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-[#191F24]">
            Your Cart
          </h2>

          <p className="text-sm text-[#3B4954]">
            {cart.length} {cart.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>
      {cart.length === 0 ? (
        <p className="text-gray-500">
          Add items to start comparing prices.
        </p>
      ) : (
        <ul className="space-y-2">
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