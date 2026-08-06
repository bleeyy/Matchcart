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
        <div className="overflow-x-auto rounded-xl border border-[#DFDCCD] bg-white">
            <table className="min-w-full border-collapse">
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
                    {/* We'll build this next */}
                </tbody>
            </table>
        </div>
    );
}