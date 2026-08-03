"use client";

import { useState } from "react";
import { products } from "@/lib/data/products";

type ProductSearchProps = {
  onSelect: (product: {
    id: number;
    name: string;
    category: string;
  }) => void;
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
    <div>
      <input
        className="border rounded-lg px-4 py-2 w-full text-black"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {search && filteredProducts.length > 0 && (
        <div className="mt-2 border rounded-lg bg-white shadow">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                onSelect(product);
                setSearch("");
              }}
              className="w-full text-left p-3 hover:bg-gray-100 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-[#191F24]">
                  {product.name}
                </p>

                <p className="text-sm text-[#3B4954]">
                  {product.category}
                </p>
              </div>

              <span className="text-[#EF846C] font-bold text-xl">
                +
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}