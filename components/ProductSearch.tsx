"use client";

import { useState } from "react";
import { products } from "@/lib/data/products";

type ProductSearchProps = {
  onSelect: (product: {
    id: number;
    name: string;
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

      {search && (
        <ul className="mt-2 border rounded-lg">
          {filteredProducts.map((product) => (
            <li
              key={product.id}
              className="p-2 hover:bg-gray-100 cursor-pointer text-black"
              onClick={() => {
                onSelect(product);
                setSearch("");
              }}
            >
              {product.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}