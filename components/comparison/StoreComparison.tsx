"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { CartItem } from "@/types/cart";

import type { StoreTotal } from "@/lib/comparison/calculateTotals";

import { MatchCartPrice } from "@/lib/data/priceRepository";

type StoreComparisonProps = {
    storeTotals: StoreTotal[];
    cart: CartItem[];
    prices: MatchCartPrice[];
    dataStatus: "live" | "sample";
};

export default function StoreComparison({
    storeTotals,
    cart,
    prices,
    dataStatus,
}: StoreComparisonProps) {
    const [expanded, setExpanded] =
        useState(false);

    if (storeTotals.length === 0) {
        return null;
    }

    const completeStoreTotals =
        storeTotals.filter(
            (store) =>
                store.missingItems === 0
        );

    const cheapestTotal =
        completeStoreTotals.length > 0
            ? Math.min(
                ...completeStoreTotals.map(
                    (store) =>
                        store.total
                )
            )
            : null;

    const findPrice = (
        storeId: number,
        item: CartItem
    ) => {
        /*
         * Exact size first.
         */
        let match = prices.find(
            (price) =>
                price.storeId ===
                    storeId &&
                price.productId ===
                    item.productId &&
                item.sizeId != null &&
                price.sizeId ===
                    item.sizeId
        );

        /*
         * Product-level fallback.
         */
        if (!match) {
            match = prices.find(
                (price) =>
                    price.storeId ===
                        storeId &&
                    price.productId ===
                        item.productId &&
                    price.sizeId == null
            );
        }

        return match ?? null;
    };

    return (
        <div className="comparison-reveal comparison-reveal-late mt-6 overflow-hidden rounded-[1.35rem] border border-[#ded6c9] bg-[#fffdf8] shadow-[0_10px_28px_rgba(82,66,44,0.05)]">

            <button
                type="button"
                onClick={() =>
                    setExpanded(!expanded)
                }
                className="flex w-full items-center justify-between p-4"
            >
                <div className="text-left">
                    <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#243239]">
                        The store showdown
                    </h2>

                    <p className="text-sm text-[#68736f]">
                        A quick look at what your whole list costs.
                    </p>

                    <p className="mt-1 text-xs text-[#68736f]/70">
                        {dataStatus ===
                        "live"
                            ? "Using connected retailer pricing"
                            : "Using sample pricing data"}
                    </p>
                </div>

                <ChevronDown
                    className={`transition-transform duration-500 ${
                        expanded
                            ? "rotate-180"
                            : ""
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
                <div className="space-y-5 border-t border-[#DFDCCD] p-4">

                    {/* STORE TOTALS */}

                    <div className="space-y-2">
                        {storeTotals.map(
                            (
                                store,
                                index
                            ) => (
                                <div
                                    key={
                                        store.storeId
                                    }
                                    className={`flex items-center justify-between rounded-lg border p-3 ${
                                        cheapestTotal !==
                                            null &&
                                        store.total ===
                                            cheapestTotal &&
                                        store.missingItems ===
                                            0
                                            ? "border-green-500 bg-green-50"
                                            : "border-[#ded6c9]"
                                    }`}
                                >
                                    <div>
                                        <p className="font-semibold text-[#191F24]">
                                            {index +
                                                1}
                                            .{" "}
                                            {
                                                store.storeName
                                            }
                                        </p>

                                        {store.missingItems >
                                        0 ? (
                                            <p className="text-xs text-amber-600">
                                                {
                                                    store.missingItems
                                                }{" "}
                                                item
                                                {store.missingItems ===
                                                1
                                                    ? ""
                                                    : "s"}{" "}
                                                missing price
                                            </p>
                                        ) : cheapestTotal !==
                                              null &&
                                          store.total ===
                                              cheapestTotal ? (
                                            <p className="text-sm text-green-700">
                                                Lowest
                                                Total
                                            </p>
                                        ) : (
                                            <p className="text-sm text-[#3B4954]">
                                                {cheapestTotal !==
                                                null
                                                    ? `+$${(
                                                        store.total -
                                                        cheapestTotal
                                                    ).toFixed(
                                                        2
                                                    )}`
                                                    : "—"}
                                            </p>
                                        )}
                                    </div>

                                    <span className="font-bold text-black">
                                        $
                                        {store.total.toFixed(
                                            2
                                        )}
                                    </span>
                                </div>
                            )
                        )}
                    </div>

                    {/* INDIVIDUAL PRODUCTS */}

                    <div>
                        <h3 className="mb-3 font-[family-name:var(--font-display)] text-xl text-[#243239]">
                            Price by item
                        </h3>

                        <div className="overflow-x-auto rounded-xl border border-[#ded6c9]">
                            <table className="w-full min-w-[520px] text-sm">
                                <thead>
                                    <tr className="border-b border-[#ded6c9] bg-[#f5f1e8]">
                                        <th className="px-3 py-3 text-left font-bold text-[#243239]">
                                            Product
                                        </th>

                                        {storeTotals.map(
                                            (
                                                store
                                            ) => (
                                                <th
                                                    key={
                                                        store.storeId
                                                    }
                                                    className="px-3 py-3 text-right font-bold text-[#243239]"
                                                >
                                                    {
                                                        store.storeName
                                                    }
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {cart.map(
                                        (
                                            item
                                        ) => (
                                            <tr
                                                key={
                                                    item.id
                                                }
                                                className="border-b border-[#eee8dc] last:border-b-0"
                                            >
                                                <td className="px-3 py-3">
                                                    <div className="font-semibold text-[#243239]">
                                                        {
                                                            item.name
                                                        }
                                                    </div>

                                                    {(item.variantName ||
                                                        item.sizeLabel) && (
                                                        <div className="text-xs text-[#68736f]">
                                                            {item.variantName
                                                                ? item.variantName
                                                                : ""}
                                                            {item.variantName &&
                                                            item.sizeLabel
                                                                ? " • "
                                                                : ""}
                                                            {item.sizeLabel
                                                                ? item.sizeLabel
                                                                : ""}
                                                        </div>
                                                    )}

                                                    {item.quantity >
                                                        1 && (
                                                        <div className="text-xs text-[#68736f]">
                                                            Qty:{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </div>
                                                    )}
                                                </td>

                                                {storeTotals.map(
                                                    (
                                                        store
                                                    ) => {
                                                        const price =
                                                            findPrice(
                                                                store.storeId,
                                                                item
                                                            );

                                                        return (
                                                            <td
                                                                key={`${store.storeId}-${item.id}`}
                                                                className="px-3 py-3 text-right"
                                                            >
                                                                {price ? (
                                                                    <div>
                                                                        <div className="font-semibold text-[#191F24]">
                                                                            $
                                                                            {price.price.toFixed(
                                                                                2
                                                                            )}
                                                                        </div>

                                                                        {item.quantity >
                                                                            1 && (
                                                                            <div className="text-xs text-[#68736f]">
                                                                                $
                                                                                {(
                                                                                    price.price *
                                                                                    item.quantity
                                                                                ).toFixed(
                                                                                    2
                                                                                )}{" "}
                                                                                total
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs font-semibold text-amber-600">
                                                                        —
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    }
                                                )}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}