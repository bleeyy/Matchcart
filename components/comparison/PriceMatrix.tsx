
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { stores } from "@/lib/data/stores";
import { products } from "@/lib/data/products";
import { prices } from "@/lib/data/prices";
import { CartItem } from "@/types/cart";

type PriceMatrixProps = {
    cart: CartItem[];
};

export default function PriceMatrix({
    cart,
}: PriceMatrixProps) {

    const [expanded, setExpanded] = useState(false);

    return (
        <div className="mt-6 border border-[#DFDCCD] rounded-xl bg-white overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex justify-between items-center p-4"
            >
                <div className="text-left">
                    <h2 className="text-xl font-bold text-[#191F24]">
                        Price Breakdown
                    </h2>

                    <p className="text-sm text-[#3B4954]">
                        Compare item prices across stores
                    </p>
                </div>

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
                                    <th className="sticky left-0 bg-white px-4 py-3 text-left font-semibold text-[#191F24]">
                                        Item
                                    </th>

                                    {stores.map((store) => (
                                        <th
                                            key={store.id}
                                            className="px-4 py-3 text-center font-semibold text-[#191F24] whitespace-nowrap"
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

                                            {stores.map((store) => {
                                                const price = prices.find(
                                                    (item) =>
                                                        item.productId === product.id &&
                                                        item.storeId === store.id
                                                );

                                                const isCheapest =
                                                    price &&
                                                    price.price ===
                                                    Math.min(
                                                        ...prices
                                                            .filter(
                                                                (item) =>
                                                                    item.productId === product.id
                                                            )
                                                            .map((item) => item.price)
                                                    );

                                                return (
                                                    <td
                                                        key={store.id}
                                                        className="px-4 py-3 text-center"
                                                    >
                                                        {price ? (
                                                            <span
                                                                className={
                                                                    isCheapest
                                                                        ? "bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold"
                                                                        : "text-[#3B4954]"
                                                                }
                                                            >
                                                                ${price.price.toFixed(2)}
                                                            </span>
                                                        ) : (
                                                            "N/A"
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

                                    {stores.map((store) => {
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