import { CartItem as CartItemType } from "@/types/cart";
import CartItem from "./CartItem";

import EmptyCart from "./EmptyCart";
import { ChevronDown, ChevronUp } from "lucide-react";

type CartProps = {
  cart: CartItemType[];
  removeItem: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  highlightedItem: number | null;
  headerAction?: React.ReactNode;
  isMinimized: boolean;
  onToggleMinimized: () => void;
};

export default function Cart({
  cart,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  highlightedItem,
  headerAction,
  isMinimized,
  onToggleMinimized,
}: CartProps) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-[-0.03em] text-[#243239]">
            Your list
          </h2>
        </div>

        <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
          {headerAction}

          {cart.length > 0 && (
            <button
              type="button"
              onClick={onToggleMinimized}
              aria-expanded={!isMinimized}
              aria-controls="cart-items"
              className="flex min-h-11 items-center gap-1.5 text-sm font-bold text-[#68736f] transition hover:text-[#d75e55]"
            >
              {isMinimized ? "Show list" : "Minimize list"}
              {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          )}
        </div>
      </div>

      {cart.length === 0 ? (
        <EmptyCart
          onStartShopping={() => {
            document
              .querySelector<HTMLInputElement>('input[placeholder="Add an item to your list..."]')
              ?.focus();
          }}
        />
      ) : (
        <div
          id="cart-items"
          className={`grid overflow-hidden transition-[grid-template-rows] duration-[600ms] ease-out ${
            isMinimized ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
          }`}
        >
          <ul
            className={`min-h-0 space-y-3 transition-[opacity,transform] duration-[600ms] ease-out ${
              isMinimized
                ? "-translate-y-2 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
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
        </div>
      )}
    </>
  );
}