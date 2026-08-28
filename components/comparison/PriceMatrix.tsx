"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { stores } from "@/lib/data/stores";
import { products } from "@/lib/data/products";
import { CartItem } from "@/types/cart";
import type { MatchCartPrice } from "@/lib/data/priceRepository";

type PriceMatrixProps = {
    cart: CartItem[];
    selectedStoreIds: number[];
    prices: MatchCartPrice[];
};

export default function PriceMatrix({
    cart,
    selectedStoreIds,
    prices,
}: PriceMatrixProps) {
    const [expanded, setExpanded] = useState(false);

    const latestUpdatedAt = prices.reduce<string | null>(
        (latest, price) => {
            if (!latest) return price.updatedAt;

            return new Date(price.updatedAt) > new Date(latest)
                ? price.updatedAt
                : latest;
        },
        null
    );

    const hasLivePrices = prices.some(
        (price) => price.source !== "seed"
    );

    if (cart.length === 0) {
        return null;
    }

    /*
     * Find the price for the EXACT cart item.
     *
     * Product + store + size
     *
     * Size IDs uniquely identify the selected
     * product/variant in the current data model.
     */
    const getPriceForCartItem = (
        cartItem: CartItem,
        storeId: number
    ): MatchCartPrice | undefined => {
        return prices.find((price) => {
            if (
                price.productId !== cartItem.productId ||
                price.storeId !== storeId
            ) {
                return false;
            }

            /*
             * Cart item has a specific size.
             * Match that exact size.
             */
            if (cartItem.sizeId != null) {
                return price.sizeId === cartItem.sizeId;
            }

            /*
             * Cart item has no specific size.
             * Use a price that also has no size.
             */
            return price.sizeId == null;
        });
    };

    const selectedStores = stores.filter((store) =>
        selectedStoreIds.includes(store.id)
    );

    return (
        <div className="mt-6 overflow-hidden rounded-[1.35rem] border border-[#ded6c9] bg-[#fffdf8] shadow-[0_10px_28px_rgba(82,66,44,0.05)]">
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-between p-4"
            >
                <div className="text-left">
                    <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#243239]">
                        Every item, side by side
                    </h2>

                    <p className="text-sm text-[#68736f]">
                        Compare item prices across stores
                    </p>

                    {latestUpdatedAt && (
                        <p className="mt-1 text-xs text-[#3B4954]/70">
                            {hasLivePrices
                                ? `Prices updated ${new Date(
                                    latestUpdatedAt
                                ).toLocaleDateString()}`
                                : "Using sample pricing data"}
                        </p>
                    )}
                </div>

                <ChevronDown
                    className={`transition-transform duration-300 ${
                        expanded ? "rotate-180" : ""
                    }`}
                />
            </button>

            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expanded
                        ? "max-h-[1200px] opacity-100"
                        : "max-h-0 opacity-0"
                }`}
            >
                <div className="border-t border-[#DFDCCD] p-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-max border-collapse">
                            <thead>
                                <tr className="border-b border-[#DFDCCD]">
                                    <th className="sticky left-0 bg-[#fffdf8] px-4 py-3 text-left font-bold text-[#243239]">
                                        Item
                                    </th>

                                    {selectedStores.map((store) => (
                                        <th
                                            key={store.id}
                                            className="whitespace-nowrap px-4 py-3 text-center font-bold text-[#243239]"
                                        >
                                            {store.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {cart.map((cartItem) => {
                                    const product = products.find(
                                        (product) =>
                                            product.id ===
                                            cartItem.productId
                                    );

                                    if (!product) {
                                        return null;
                                    }

                                    /*
                                     * Find prices for this exact cart item
                                     * across all selected stores once.
                                     */
                                    const selectedStorePrices =
                                        selectedStoreIds
                                            .map((storeId) =>
                                                getPriceForCartItem(
                                                    cartItem,
                                                    storeId
                                                )
                                            )
                                            .filter(
                                                (
                                                    price
                                                ): price is MatchCartPrice =>
                                                    price !== undefined
                                            );

                                    const cheapestSelectedPrice =
                                        selectedStorePrices.length > 0
                                            ? Math.min(
                                                ...selectedStorePrices.map(
                                                    (price) =>
                                                        price.price
                                                )
                                            )
                                            : null;

                                    return (
                                        <tr
                                            key={cartItem.id}
                                            className="border-b border-[#DFDCCD]"
                                        >
                                            <td className="sticky left-0 bg-white px-4 py-3 font-semibold text-[#191F24]">
                                                <div>
                                                    {product.name}

                                                    {cartItem.variantName && (
                                                        <div className="text-xs font-normal text-[#68736f]">
                                                            {
                                                                cartItem.variantName
                                                            }
                                                        </div>
                                                    )}

                                                    {cartItem.sizeLabel && (
                                                        <div className="text-xs font-normal text-[#68736f]">
                                                            {
                                                                cartItem.sizeLabel
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {selectedStores.map((store) => {
                                                const price =
                                                    getPriceForCartItem(
                                                        cartItem,
                                                        store.id
                                                    );

                                                const isCheapest =
                                                    price !== undefined &&
                                                    cheapestSelectedPrice !==
                                                        null &&
                                                    price.price ===
                                                        cheapestSelectedPrice;

                                                const isOnSale =
                                                    price !== undefined &&
                                                    price.promoPrice !== null &&
                                                    price.regularPrice !== null &&
                                                    price.promoPrice <
                                                        price.regularPrice;

                                                return (
                                                    <td
                                                        key={store.id}
                                                        className="px-4 py-3 text-center"
                                                    >
                                                        {price ? (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span
                                                                    className={
                                                                        isCheapest
                                                                            ? "rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700"
                                                                            : "text-[#3B4954]"
                                                                    }
                                                                >
                                                                    $
                                                                    {price.price.toFixed(
                                                                        2
                                                                    )}
                                                                </span>

                                                                {isOnSale && (
                                                                    <span className="text-xs font-medium text-[#EF846C]">
                                                                        Sale
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[#9a9d94]">
                                                                N/A
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>

                            <tfoot>
                                <tr className="border-t-2 border-[#DFDCCD]">
                                    <td className="sticky left-0 bg-white px-4 py-4 font-bold text-[#191F24]">
                                        Total Cart
                                    </td>

                                    {selectedStores.map((store) => {
                                        const total = cart.reduce(
                                            (sum, cartItem) => {
                                                const price =
                                                    getPriceForCartItem(
                                                        cartItem,
                                                        store.id
                                                    );

                                                return (
                                                    sum +
                                                    (price?.price ?? 0) *
                                                        cartItem.quantity
                                                );
                                            },
                                            0
                                        );

                                        return (
                                            <td
                                                key={store.id}
                                                className="px-4 py-4 text-center font-bold text-[#191F24]"
                                            >
                                                $
                                                {total.toFixed(
                                                    2
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}