import { hebRetailer } from "@/lib/retailers/heb";
import { aldiRetailer } from "@/lib/retailers/aldi";
import { targetRetailer } from "@/lib/retailers/target";
import { krogerRetailer } from "@/lib/retailers/kroger";

import type {
    RetailerAdapter,
    RetailerPrice,
} from "@/lib/retailers/types";

export type Retailer = {
    storeId: number;
    name: string;
    adapter: RetailerAdapter;
};

export const retailers: Retailer[] = [
    {
        storeId: 1,
        name: "H-E-B",
        adapter: hebRetailer,
    },
    {
        storeId: 2,
        name: "ALDI",
        adapter: aldiRetailer,
    },
    {
        storeId: 3,
        name: "Target",
        adapter: targetRetailer,
    },
    {
        storeId: 4,
        name: "Kroger",
        adapter: krogerRetailer,
    },
];

/*
 * Maximum amount of time we allow a retailer
 * lookup to take.
 *
 * This prevents one broken/slow retailer from
 * making the entire MatchCart comparison hang.
 */
const RETAILER_TIMEOUT_MS = 10_000;

async function searchRetailerWithTimeout(
    retailer: Retailer,
    productName: string
): Promise<RetailerPrice | null> {
    try {
        /*
         * Race the retailer request against a timeout.
         *
         * IMPORTANT:
         * This does not necessarily cancel the underlying
         * request, but it prevents MatchCart from waiting
         * for it.
         */
        const timeoutPromise =
            new Promise<null>((resolve) => {
                setTimeout(
                    () => resolve(null),
                    RETAILER_TIMEOUT_MS
                );
            });

        const pricePromise =
            retailer.adapter.searchProduct(
                productName
            );

        const price =
            await Promise.race([
                pricePromise,
                timeoutPromise,
            ]);

        return price;
    } catch (error) {
        /*
         * Keep retailer failures isolated.
         *
         * A failure at H-E-B, ALDI, or Target should
         * NEVER prevent Kroger or another retailer
         * from returning a price.
         */
        const message =
            error instanceof Error
                ? error.message
                : String(error);

        console.warn(
            `${retailer.name} unavailable for "${productName}": ${message}`
        );

        return null;
    }
}

export async function searchAllRetailers(
    productName: string,
    selectedStoreIds: number[]
): Promise<
    {
        storeId: number;
        price: RetailerPrice | null;
    }[]
> {
    /*
     * Only search retailers selected by the user.
     */
    const selectedRetailers =
        retailers.filter(
            (retailer) =>
                selectedStoreIds.includes(
                    retailer.storeId
                )
        );

    /*
     * Search all selected retailers concurrently.
     *
     * Each retailer has its own timeout/error
     * handling, so one failure does not affect
     * the others.
     */
    const results = await Promise.all(
        selectedRetailers.map(
            async (retailer) => {
                const price =
                    await searchRetailerWithTimeout(
                        retailer,
                        productName
                    );

                return {
                    storeId:
                        retailer.storeId,
                    price,
                };
            }
        )
    );

    /*
     * Only return the results in the format expected
     * by compareCart().
     */
    return results;
}