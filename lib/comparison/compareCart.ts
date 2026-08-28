import { CartItem } from "@/types/cart";

import {
    calculateTotals,
} from "@/lib/comparison/calculateTotals";

import {
    getCurrentPrices,
} from "@/lib/data/priceRepository";

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

    /*
     * Get the latest prices directly from Supabase.
     *
     * This is now the source of truth for the
     * price comparison.
     */
    const currentPrices = await getCurrentPrices();

    /*
     * Only keep prices for the stores the user
     * selected.
     */
    const comparisonPrices = currentPrices.filter(
        (price) =>
            selectedStoreIds.includes(price.storeId)
    );

    /*
     * Calculate the cart totals using the prices
     * retrieved from Supabase.
     */
    const totals = calculateTotals(
        cart,
        selectedStoreIds,
        comparisonPrices
    );

    return {
        totals,
        prices: comparisonPrices,
    };
}