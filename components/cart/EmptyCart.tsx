import { Search, ShoppingCart } from "lucide-react";

type EmptyCartProps = {
  onStartShopping: () => void;
};

export default function EmptyCart({
  onStartShopping,
}: EmptyCartProps) {
  return (
    <div className="rounded-[1.35rem] border border-dashed border-[#cfc5b6] bg-[#f1eadf]/45 px-5 py-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 rotate-3 items-center justify-center rounded-[1.2rem] bg-[#b8c8a4]/55 transition-transform duration-300 hover:-rotate-3 hover:scale-105">
        <ShoppingCart
          size={30}
          strokeWidth={1.8}
          className="text-[#3f594a]"
        />
      </div>

      <h3 className="font-[family-name:var(--font-display)] text-2xl text-[#243239]">
        Your list is still a blank page.
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#68736f]">
        Add a few staples and we&apos;ll turn the blank page into a better-priced shop.
      </p>

      <button
        onClick={onStartShopping}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#ee806c] px-5 py-3 font-bold text-[#243239] shadow-[0_8px_18px_rgba(215,94,85,0.18)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
      >
        <Search size={18} />
        Search for products
      </button>

      <div className="mx-auto mt-8 max-w-sm border-t border-[#ded6c9] pt-6 text-left">
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