
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { stores } from "@/lib/data/stores";
import { products } from "@/lib/data/products";
import { CartItem } from "@/types/cart";

type PriceData = {

    productId: number;
    storeId: number;
    price: number;
    currency: string;
    source: string;
    updatedAt: string;
    regularPrice: number | null;
    promoPrice: number | null;
};

type PriceMatrixProps = {
    cart: CartItem[];
    selectedStoreIds: number[];
    prices: PriceData[];
};

export default function PriceMatrix({
    cart,
    selectedStoreIds,
    prices
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

    return (
        <div className="mt-6 overflow-hidden rounded-[1.35rem] border border-[#ded6c9] bg-[#fffdf8] shadow-[0_10px_28px_rgba(82,66,44,0.05)]">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex justify-between items-center p-4"
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
                    )}                </div>

                <ChevronDown
                    className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""
                        }`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded
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

                                    {stores
                                        .filter((store) => selectedStoreIds.includes(store.id))
                                        .map((store) => (
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
                                        (product) => product.id === cartItem.productId
                                    );

                                    if (!product) return null;

                                    return (
                                        <tr
                                            key={product.id}
                                            className="border-b border-[#DFDCCD]"
                                        >
                                            <td className="sticky left-0 bg-white px-4 py-3 font-semibold text-[#191F24]">
                                                {product.name}
                                            </td>

                                            {stores
                                                .filter((store) => selectedStoreIds.includes(store.id))
                                                .map((store) => {
                                                    const price = prices.find(
                                                        (item) =>
                                                            item.productId === product.id &&
                                                            item.storeId === store.id
                                                    );

                                                    const selectedStorePrices = prices.filter(
                                                        (item) =>
                                                            item.productId === product.id &&
                                                            selectedStoreIds.includes(item.storeId)
                                                    );

                                                    const cheapestSelectedPrice = Math.min(
                                                        ...selectedStorePrices.map((item) => item.price)
                                                    );

                                                    const isCheapest =
                                                        price?.price === cheapestSelectedPrice;

                                                    const isOnSale =
                                                        price &&
                                                        price.promoPrice !== null &&
                                                        price.regularPrice !== null &&
                                                        price.promoPrice < price.regularPrice;

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
                                                                        ${price.price.toFixed(2)}
                                                                    </span>

                                                                    {isOnSale && (
                                                                        <span className="text-xs font-medium text-[#EF846C]">
                                                                            Sale
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                "N/A"
                                                            )}                                                    </td>
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

                                    {stores
                                        .filter((store) => selectedStoreIds.includes(store.id))
                                        .map((store) => {
                                            const total = cart.reduce((sum, cartItem) => {
                                                const price = prices.find(
                                                    (item) =>
                                                        item.productId === cartItem.productId &&
                                                        item.storeId === store.id
                                                );

                                                return sum + (price?.price ?? 0) * cartItem.quantity;
                                            }, 0);

                                            return (
                                                <td
                                                    key={store.id}
                                                    className="px-4 py-4 text-center font-bold text-[#191F24]"
                                                >
                                                    ${total.toFixed(2)}
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