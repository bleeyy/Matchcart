import { CartItem } from "@/types/cart";

import {
    calculateTotals,
} from "@/lib/comparison/calculateTotals";

import {
    getProducts,
} from "@/lib/data/getProducts";

import {
    saveRetailerPrice,
} from "@/lib/data/priceRepository";

import {
    searchAllRetailers,
} from "@/lib/retailers";

import type { MatchCartPrice } from "@/lib/data/priceRepository";

export async function compareCart(
    cart: CartItem[],
    selectedStoreIds: number[]
) {
    if (cart.length === 0) {
        return {
            totals: [],
            prices: [],
        };
    }

    if (selectedStoreIds.length === 0) {
        return {
            totals: [],
            prices: [],
        };
    }

    const products = await getProducts();

    const productById = new Map(
        products.map((product) => [
            product.id,
            product,
        ])
    );

    const itemResults = await Promise.all(
        cart.map(async (item) => {
            const product =
                productById.get(item.productId);

            if (!product) {
                console.warn(
                    `No product found for cart item ${item.productId}`
                );

                return [];
            }

            const variant =
                product.variants.find(
                    (variant) =>
                        variant.name ===
                        item.variantName
                );

            if (!variant) {
                console.warn(
                    `No variant found for ${product.name}: ${item.variantName}`
                );

                return [];
            }

            const size =
                variant.sizes.find(
                    (size) =>
                        size.label ===
                        item.sizeLabel
                );

            if (!size) {
                console.warn(
                    `No size found for ${product.name} ${item.variantName}: ${item.sizeLabel}`
                );

                return [];
            }

            const searchTerms = [
                product.name,
                variant.name,
                size.label,
            ].filter(Boolean);

            const searchQuery =
                searchTerms.join(" ");

            let results;

            try {
                results =
                    await searchAllRetailers(
                        searchQuery,
                        selectedStoreIds
                    );
            } catch (error) {
                console.error(
                    `Failed to search retailers for "${searchQuery}":`,
                    error
                );

                return [];
            }

            const livePrices: MatchCartPrice[] =
                results
                    .filter(
                        (result) =>
                            result.price !== null
                    )
                    .map(
                        (result) => ({
                            productId:
                                item.productId,

                            storeId:
                                result.storeId,

                            price:
                                result.price!.price,

                            currency:
                                result.price!.currency,

                            source:
                                result.price!.source,

                            updatedAt:
                                result.price!.updatedAt,

                            regularPrice:
                                result.price!
                                    .regularPrice,

                            promoPrice:
                                result.price!
                                    .promoPrice,

                            sizeId:
                                size.id,
                        })
                    );

            await Promise.all(
                results.map(
                    async (result) => {
                        if (
                            result.price ===
                            null
                        ) {
                            return;
                        }

                        try {
                            await saveRetailerPrice(
                                item.productId,
                                result.storeId,
                                variant.id,
                                size.id,
                                {
                                    externalProductId:
                                        `${result.storeId}-${item.productId}-${variant.id}-${size.id}`,

                                    productName:
                                        product.name,

                                    brand:
                                        null,

                                    price:
                                        result.price
                                            .price,

                                    regularPrice:
                                        result.price
                                            .regularPrice,

                                    promoPrice:
                                        result.price
                                            .promoPrice,

                                    currency:
                                        result.price
                                            .currency,

                                    source:
                                        result.price
                                            .source,

                                    updatedAt:
                                        result.price
                                            .updatedAt,
                                }
                            );
                        } catch (error) {
                            console.error(
                                `Failed to save price for ${product.name}:`,
                                error
                            );
                        }
                    }
                )
            );

            return livePrices;
        })
    );

    const comparisonPrices =
        itemResults.flat();

    const totals =
        calculateTotals(
            cart,
            selectedStoreIds,
            comparisonPrices
        );

    return {
        totals,
        prices: comparisonPrices,
    };
}