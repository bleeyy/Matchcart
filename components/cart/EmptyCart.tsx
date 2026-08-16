import { Search, ShoppingCart } from "lucide-react";

type EmptyCartProps = {
  onStartShopping: () => void;
};

export default function EmptyCart({
  onStartShopping,
}: EmptyCartProps) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#CEB9BC]/40">
        <ShoppingCart
          size={30}
          strokeWidth={1.8}
          className="text-[#3B4954]"
        />
      </div>

      <h3 className="text-xl font-bold text-[#191F24]">
        Start building your cart
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#3B4954]">
        Add groceries to see prices across the stores you selected.
      </p>

      <button
        onClick={onStartShopping}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#EF846C] px-5 py-3 font-semibold text-[#191F24] transition-transform duration-200 active:scale-95"
      >
        <Search size={18} />
        Search for products
      </button>

      <div className="mx-auto mt-8 max-w-sm border-t border-[#DFDCCD] pt-6 text-left">
        <p className="mb-3 text-sm font-semibold text-[#191F24]">
          How MatchCart works
        </p>

        <div className="space-y-3 text-sm text-[#3B4954]">
          <p>
            <span className="font-semibold text-[#191F24]">1.</span>{" "}
            Add the groceries you need.
          </p>

          <p>
            <span className="font-semibold text-[#191F24]">2.</span>{" "}
            Compare prices across your stores.
          </p>

          <p>
            <span className="font-semibold text-[#191F24]">3.</span>{" "}
            Find the cheapest cart.
          </p>
        </div>
      </div>
    </div>
  );
}