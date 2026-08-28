import { Minus, Plus, Trash2, AlertCircle } from "lucide-react";
import { CartItem as CartItemType } from "@/types/cart";

type CartItemProps = {
  item: CartItemType;
  removeItem: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  highlighted: boolean;
};

export default function CartItem({
  item,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  highlighted,
}: CartItemProps) {
  const needsSize = !item.sizeId;

  return (
    <li
      className={`cart-item-enter rounded-2xl border p-4 transition-all duration-300 ${
        highlighted
          ? "scale-[1.02] border-[#ee806c] bg-[#ee806c]/10"
          : "border-[#ded6c9] bg-[#fffdf8] shadow-[0_8px_24px_rgba(82,66,44,0.05)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Main product name */}
          <p className="truncate font-bold text-[#243239]">
            {item.name}
          </p>

          {/* Variant */}
          {item.variantName && (
            <p className="mt-1 text-sm font-semibold text-[#3B4954]">
              {item.variantName}
            </p>
          )}

          {/* Size */}
          {item.sizeLabel && (
            <p className="mt-0.5 text-sm text-[#68736f]">
              {item.sizeLabel}
            </p>
          )}

          {/* No size selected */}
          {needsSize && (
            <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-amber-600">
              <AlertCircle size={15} />
              <span>Select a size to compare prices</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-[#68736f] transition hover:bg-[#ee806c]/10 hover:text-[#d75e55]"
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center rounded-xl border border-[#ded6c9] bg-[#f1eadf]">
          <button
            type="button"
            onClick={() => decreaseQuantity(item.id)}
            disabled={item.quantity === 1}
            className="flex h-11 w-11 items-center justify-center rounded-l-xl text-[#243239] transition hover:bg-[#ded6c9] active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={`Decrease ${item.name} quantity`}
          >
            <Minus size={18} />
          </button>

          <span className="flex h-11 min-w-11 items-center justify-center px-2 font-bold text-[#243239]">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => increaseQuantity(item.id)}
            className="flex h-11 w-11 items-center justify-center rounded-r-xl text-[#243239] transition hover:bg-[#ee806c]/25 active:scale-90"
            aria-label={`Increase ${item.name} quantity`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </li>
  );
}