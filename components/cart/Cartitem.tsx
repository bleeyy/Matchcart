import { Minus, Plus, Trash2 } from "lucide-react";
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
  return (
    <li
      className={`rounded-2xl border p-4 transition-all duration-300 ${
        highlighted
          ? "scale-[1.02] border-[#EF846C] bg-[#EF846C]/10"
          : "border-[#DFDCCD] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#191F24]">
            {item.name}
          </p>

          <p className="mt-1 text-sm text-[#3B4954]">
            Grocery item
          </p>
        </div>

        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="rounded-lg p-2 text-[#3B4954] transition hover:bg-red-50 hover:text-red-600"
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center rounded-xl border border-[#DFDCCD] bg-[#DFDCCD]/30">
          <button
            type="button"
            onClick={() => decreaseQuantity(item.id)}
            disabled={item.quantity === 1}
            className="flex h-11 w-11 items-center justify-center rounded-l-xl text-[#191F24] transition hover:bg-[#DFDCCD]/60 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={`Decrease ${item.name} quantity`}
          >
            <Minus size={18} />
          </button>

          <span className="flex h-11 min-w-11 items-center justify-center px-2 font-semibold text-[#191F24]">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => increaseQuantity(item.id)}
            className="flex h-11 w-11 items-center justify-center rounded-r-xl text-[#191F24] transition hover:bg-[#EF846C]/20"
            aria-label={`Increase ${item.name} quantity`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </li>
  );
}