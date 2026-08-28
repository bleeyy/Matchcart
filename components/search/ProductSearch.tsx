"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

import { products } from "@/lib/data/products";
import { Product } from "@/types/product";

type ProductSearchProps = {
    onSelect: (
        product: Product,
        sizeId?: number,
        sizeLabel?: string,
        variantId?: number,
        variantName?: string
    ) => void;
};

export default function ProductSearch({
    onSelect,
}: ProductSearchProps) {
    const [search, setSearch] = useState("");
    const [openProductId, setOpenProductId] =
        useState<number | null>(null);
    const [openVariantId, setOpenVariantId] =
        useState<number | null>(null);

    /*
     * Rank products by relevance.
     *
     * Priority:
     * 1. Exact product name
     * 2. Product name starts with search
     * 3. Product name contains search
     * 4. Variant name starts with search
     * 5. Variant name contains search
     * 6. Category matches
     *
     * Only the 6 highest-ranked products are shown.
     */
    const filteredProducts = products
        .map((product) => {
            const query = search.trim().toLowerCase();

            if (!query) {
                return {
                    product,
                    score: 0,
                };
            }

            const name = product.name.toLowerCase();
            const category =
                product.category.toLowerCase();

            const variantNames =
                product.variants
                    .map((variant) =>
                        variant.name.toLowerCase()
                    )
                    .join(" ");

            const sizeLabels =
                product.variants
                    .flatMap((variant) =>
                        variant.sizes.map((size) =>
                            size.label.toLowerCase()
                        )
                    )
                    .join(" ");

            let score = 0;

            // Product name
            if (name === query) {
                score = 1000;
            } else if (name.startsWith(query)) {
                score = 800;
            } else if (name.includes(query)) {
                score = 600;
            }

            // Variant names
            if (
                variantNames === query
            ) {
                score = Math.max(score, 500);
            } else if (
                variantNames.startsWith(query)
            ) {
                score = Math.max(score, 450);
            } else if (
                variantNames.includes(query)
            ) {
                score = Math.max(score, 400);
            }

            // Category
            if (category === query) {
                score = Math.max(score, 250);
            } else if (category.includes(query)) {
                score = Math.max(score, 200);
            }

            // Sizes
            if (sizeLabels.includes(query)) {
                score = Math.max(score, 150);
            }

            // General fallback
            const searchableText = [
                name,
                category,
                variantNames,
                sizeLabels,
            ].join(" ");

            if (searchableText.includes(query)) {
                score = Math.max(score, 50);
            }

            return {
                product,
                score,
            };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            return a.product.name.localeCompare(
                b.product.name
            );
        })
        .slice(0, 6)
        .map((item) => item.product);

    const clearSearch = () => {
        setSearch("");
        setOpenProductId(null);
        setOpenVariantId(null);
    };

    return (
        <div className="relative z-10">
            {/* Search */}
            <div className="relative">
                <Search
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#68736f]"
                    size={19}
                />

                <input
                    className="w-full rounded-2xl border border-[#ded6c9] bg-[#fffdf8] px-12 py-4 text-[#243239] shadow-[0_10px_30px_rgba(82,66,44,0.06)] outline-none transition placeholder:text-[#9a9d94] focus:border-[#ee806c] focus:ring-4 focus:ring-[#ee806c]/15"
                    placeholder="Add an item to your list..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setOpenProductId(null);
                        setOpenVariantId(null);
                    }}
                />
            </div>

            {/* Results */}
            {search &&
                filteredProducts.length > 0 && (
                    <div className="search-results-enter mt-2 overflow-hidden rounded-xl border border-[#ded6c9] bg-[#fffdf8] shadow-[0_12px_24px_rgba(82,66,44,0.09)]">
                        {filteredProducts.map(
                            (product) => {
                                const hasVariants =
                                    product.variants.length >
                                    0;

                                const isProductOpen =
                                    openProductId ===
                                    product.id;

                                return (
                                    <div
                                        key={
                                            product.id
                                        }
                                        className="border-b border-[#ded6c9]/70 last:border-0"
                                    >
                                        {/* Product header */}
                                        <div className="flex items-center justify-between gap-3 p-4">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[#191F24]">
                                                    {
                                                        product.name
                                                    }
                                                </p>

                                                <p className="text-sm text-[#68736f]">
                                                    {
                                                        product.category
                                                    }
                                                </p>
                                            </div>

                                            <div className="ml-4 flex shrink-0 items-center gap-2">
                                                {hasVariants ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setOpenProductId(
                                                                isProductOpen
                                                                    ? null
                                                                    : product.id
                                                            );

                                                            setOpenVariantId(
                                                                null
                                                            );
                                                        }}
                                                        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                                                            isProductOpen
                                                                ? "border-[#ee806c] bg-[#fff1ed] text-[#d75e55] shadow-sm"
                                                                : "border-[#ded6c9] bg-[#fffdf8] text-[#68736f] hover:border-[#ee806c]/60 hover:bg-[#fff7f3] hover:text-[#d75e55]"
                                                        }`}
                                                    >
                                                        Choose type

                                                        <ChevronDown
                                                            size={
                                                                15
                                                            }
                                                            className={`transition-transform duration-200 ${
                                                                isProductOpen
                                                                    ? "rotate-180 text-[#d75e55]"
                                                                    : "text-[#9a9d94]"
                                                            }`}
                                                        />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        aria-label={`Add ${product.name}`}
                                                        onClick={() => {
                                                            onSelect(
                                                                product
                                                            );

                                                            clearSearch();
                                                        }}
                                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ee806c] text-xl font-medium leading-none text-[#243239] shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#e87562] active:scale-95"
                                                    >
                                                        +
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Variant selector */}
                                        {hasVariants &&
                                            isProductOpen && (
                                                <div className="border-t border-[#ded6c9]/70 bg-[#f8f3ea] px-3 py-3">
                                                    <div className="mb-2 px-1">
                                                        <p className="text-xs font-bold uppercase tracking-wide text-[#9a9d94]">
                                                            Select a type
                                                        </p>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        {product.variants.map(
                                                            (
                                                                variant
                                                            ) => {
                                                                const isVariantOpen =
                                                                    openVariantId ===
                                                                    variant.id;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            variant.id
                                                                        }
                                                                        className="overflow-hidden rounded-xl border border-transparent bg-[#fffdf8] shadow-[0_2px_8px_rgba(82,66,44,0.03)]"
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setOpenVariantId(
                                                                                    isVariantOpen
                                                                                        ? null
                                                                                        : variant.id
                                                                                )
                                                                            }
                                                                            className="flex w-full items-center justify-between px-3.5 py-3 text-left transition hover:bg-[#fff8f4]"
                                                                        >
                                                                            <span className="font-semibold text-[#243239]">
                                                                                {
                                                                                    variant.name
                                                                                }
                                                                            </span>

                                                                            <ChevronDown
                                                                                size={
                                                                                    16
                                                                                }
                                                                                className={`text-[#9a9d94] transition-transform ${
                                                                                    isVariantOpen
                                                                                        ? "rotate-180"
                                                                                        : ""
                                                                                }`}
                                                                            />
                                                                        </button>

                                                                        {/* Variant sizes */}
                                                                        {isVariantOpen && (
                                                                            <div className="border-t border-[#ded6c9]/70 bg-[#f8f3ea] px-2 py-2">
                                                                                {variant.sizes.map(
                                                                                    (
                                                                                        size
                                                                                    ) => (
                                                                                        <button
                                                                                            key={
                                                                                                size.id
                                                                                            }
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                onSelect(
                                                                                                    product,
                                                                                                    size.id,
                                                                                                    size.label,
                                                                                                    variant.id,
                                                                                                    variant.name
                                                                                                );

                                                                                                clearSearch();
                                                                                            }}
                                                                                            className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-[#fffdf8]"
                                                                                        >
                                                                                            <p className="font-medium text-[#243239]">
                                                                                                {
                                                                                                    size.label
                                                                                                }
                                                                                            </p>

                                                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ee806c] text-xl font-medium leading-none text-[#243239] shadow-sm transition group-hover:scale-105 group-hover:bg-[#e87562]">
                                                                                                +
                                                                                            </div>
                                                                                        </button>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}

            {/* No results */}
            {search &&
                filteredProducts.length === 0 && (
                    <div className="mt-2 rounded-xl border border-[#ded6c9] bg-[#fffdf8] p-4 text-sm text-[#68736f] shadow-[0_12px_24px_rgba(82,66,44,0.09)]">
                        No products found.
                    </div>
                )}
        </div>
    );
}