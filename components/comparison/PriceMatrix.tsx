import { useState } from "react";

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
    const cartProducts = cart.map((cartItem) =>
        products.find(
            (product) => product.id === cartItem.productId
        )
    );
    const groupedProducts = cartProducts.reduce((groups, product) => {
        if (!product) return groups;

        if (!groups[product.category]) {
            groups[product.category] = [];
        }

        groups[product.category].push(product);

        return groups;
    }, {} as Record<string, typeof cartProducts>);

    console.log(groupedProducts);

    const [expandedDepartments, setExpandedDepartments] = useState<
        Record<string, boolean>
    >({});
    const toggleDepartment = (category: string) => {
        setExpandedDepartments((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };
    return (
        <div className="space-y-3">
            {Object.entries(groupedProducts).map(([category, products]) => (
                <div key={category} className="mb-8">
                    <button
                        onClick={() => toggleDepartment(category)}
                        className="w-full flex justify-between items-center bg-gray-100 rounded-lg p-3 mb-3"
                    >
                        <span className="text-lg font-bold text-black">
                            {category} ({products.length} items)
                        </span>

                        <span className="text-xl">
                            {expandedDepartments[category] ? "▲" : "▼"}
                        </span>
                    </button>
                    {expandedDepartments[category] && (
                        <>
                            {products.map((product) => {                        const cheapestPrice = Math.min(
                            ...prices
                                .filter((price) => price.productId === product?.id)
                                .map((price) => price.price)
                        );

                        return (
                            <div
                                key={product?.id}
                                className="border rounded-lg p-3 mb-3"
                            >
                                <p className="text-black font-semibold mb-2">
                                    {product?.icon} {product?.name}
                                </p>

                                {stores.map((store) => {
                                    const price = prices.find(
                                        (item) =>
                                            item.productId === product?.id &&
                                            item.storeId === store.id
                                    );

                                    return (
                                        <div
                                            key={store.id}
                                            className={`flex justify-between rounded-md px-2 py-1 ${price?.price === cheapestPrice
                                                ? "bg-green-100"
                                                : ""
                                                }`}
                                        >
                                            <span>{store.name}</span>

                                            <span className="font-medium">
                                                {price?.price === cheapestPrice && "⭐ "}
                                                ${price?.price.toFixed(2) ?? "N/A"}
                                            </span>
                                        </div>
                                    );
                                })}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}