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

    const products = await getProducts();

    const productById = new Map(
        products.map((product) => [
            product.id,
            product,
        ])
    );

    /*
     * Search every cart item against every
     * selected retailer.
     */
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

            /*
             * Build the retailer search query.
             *
             * Example:
             * Milk + Whole Milk + 1 gallon
             */
            const searchTerms = [
                product.name,
                item.variantName,
                item.sizeLabel,
            ].filter(Boolean);

            const searchQuery =
                searchTerms.join(" ");

            const results =
                await searchAllRetailers(
                    searchQuery,
                    selectedStoreIds
                );

            /*
             * Convert successful retailer results
             * into MatchCartPrice objects.
             */
            const livePrices: MatchCartPrice[] =
                results
                    .filter(
                        (
                            result
                        ) => result.price !== null
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
                                result.price!.regularPrice,

                            promoPrice:
                                result.price!.promoPrice,

                            /*
                             * The comparison uses the
                             * cart item's size.
                             */
                            sizeId:
                                item.sizeId ??
                                null,
                        })
                    );

            /*
             * Save each successful live retailer
             * price to Supabase.
             *
             * We use null for the database size_id
             * because the cart sizeId is not guaranteed
             * to exist in the sizes table.
             */
            await Promise.all(
                results.map(
                    async (result) => {
                        if (!result.price) {
                            return;
                        }

                        try {
                            await saveRetailerPrice(
                                item.productId,
                                result.storeId,
                                null,
                                result.price
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

    /*
     * Flatten all cart-item results into one
     * array for calculateTotals().
     */
    const comparisonPrices =
        itemResults.flat();

    /*
     * IMPORTANT:
     *
     * Only prices retrieved during this
     * comparison are used.
     *
     * We do not fall back to stale prices
     * from Supabase.
     */
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