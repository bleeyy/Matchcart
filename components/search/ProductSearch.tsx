"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { products } from "@/lib/data/products";
import { Product } from "@/types/product";

type ProductSearchProps = {
  onSelect: (product: Product) => void;
};

export default function ProductSearch({
  onSelect,
}: ProductSearchProps) {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="relative z-10">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#68736f]" size={19} />
        <input
          className="w-full rounded-2xl border border-[#ded6c9] bg-[#fffdf8] px-12 py-4 text-[#243239] shadow-[0_10px_30px_rgba(82,66,44,0.06)] outline-none transition placeholder:text-[#9a9d94] focus:border-[#ee806c] focus:ring-4 focus:ring-[#ee806c]/15"
          placeholder="Add an item to your list..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {search && filteredProducts.length > 0 && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-[#ded6c9] bg-[#fffdf8] shadow-[0_16px_35px_rgba(82,66,44,0.12)]">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                onSelect(product);
                setSearch("");
              }}
              className="flex w-full items-center justify-between border-b border-[#ded6c9]/70 p-4 text-left transition last:border-0 hover:bg-[#f1eadf]"
            >
              <div>
                <p className="font-semibold text-[#191F24]">
                  {product.name}
                </p>

                <p className="text-sm text-[#3B4954]">
                  {product.category}
                </p>
              </div>

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ee806c] text-xl font-medium leading-none text-[#243239] transition-transform group-hover:rotate-90">
                +
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}