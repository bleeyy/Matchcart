import { CartItem } from "@/types/cart";
import { stores } from "@/lib/data/stores";
import type { MatchCartPrice } from "@/lib/data/priceRepository";

export type StoreTotal = {
    storeId: number;
    storeName: string;
    total: number;
    missingItems: number;
};

export function calculateTotals(
    cart: CartItem[],
    selectedStoreIds: number[],
    prices: MatchCartPrice[]
): StoreTotal[] {
    /*
     * TEMPORARY DEBUGGING
     *
     * This lets us see exactly what the calculator
     * receives from the cart and Supabase.
     */
    console.log(
        "========== MATCHCART PRICE DEBUG =========="
    );

    console.log(
        "Cart:",
        cart.map((item) => ({
            name: item.name,
            productId: item.productId,
            variantId: item.variantId,
            variantName: item.variantName,
            sizeId: item.sizeId,
            sizeLabel: item.sizeLabel,
            quantity: item.quantity,
        }))
    );

    console.log(
        "Selected stores:",
        selectedStoreIds
    );

    console.log(
        "Total Supabase prices received:",
        prices.length
    );

    console.log(
        "Sample Supabase prices:",
        prices.slice(0, 10).map((price) => ({
            storeId: price.storeId,
            productId: price.productId,
            variantId: price.variantId,
            sizeId: price.sizeId,
            price: price.price,
            source: price.source,
        }))
    );

    console.log(
        "============================================"
    );

    const totals = stores
        .filter((store) =>
            selectedStoreIds.includes(
                Number(store.id)
            )
        )
        .map((store) => {
            let total = 0;
            let missingItems = 0;

            for (const item of cart) {
                const itemProductId =
                    Number(item.productId);

                const itemVariantId =
                    item.variantId == null
                        ? null
                        : Number(item.variantId);

                const itemSizeId =
                    item.sizeId == null
                        ? null
                        : Number(item.sizeId);

                /*
                 * Find the exact Supabase price.
                 *
                 * Number() is intentionally used on
                 * every ID so that numeric strings and
                 * numbers match correctly.
                 */
                const productPrice =
                    prices.find((price) => {
                        const priceStoreId =
                            Number(
                                price.storeId
                            );

                        const priceProductId =
                            Number(
                                price.productId
                            );

                        const priceVariantId =
                            price.variantId ==
                            null
                                ? null
                                : Number(
                                      price.variantId
                                  );

                        const priceSizeId =
                            price.sizeId == null
                                ? null
                                : Number(
                                      price.sizeId
                                  );

                        return (
                            priceStoreId ===
                                Number(
                                    store.id
                                ) &&
                            priceProductId ===
                                itemProductId &&
                            priceVariantId ===
                                itemVariantId &&
                            priceSizeId ===
                                itemSizeId
                        );
                    });

                if (!productPrice) {
                    missingItems += 1;

                    console.log(
                        "❌ MISSING PRICE:",
                        {
                            storeId:
                                store.id,
                            storeName:
                                store.name,
                            product:
                                item.name,
                            productId:
                                itemProductId,
                            variantId:
                                itemVariantId,
                            variantName:
                                item.variantName,
                            sizeId:
                                itemSizeId,
                            sizeLabel:
                                item.sizeLabel,
                        }
                    );

                    continue;
                }

                console.log(
                    "✅ PRICE MATCH:",
                    {
                        store:
                            store.name,
                        product:
                            item.name,
                        productId:
                            itemProductId,
                        variantId:
                            itemVariantId,
                        sizeId:
                            itemSizeId,
                        price:
                            productPrice.price,
                    }
                );

                total +=
                    Number(
                        productPrice.price
                    ) *
                    item.quantity;
            }

            return {
                storeId:
                    Number(store.id),

                storeName:
                    store.name,

                total,

                missingItems,
            };
        });

    return totals.sort((a, b) => {
        const aComplete =
            a.missingItems === 0;

        const bComplete =
            b.missingItems === 0;

        if (
            aComplete &&
            !bComplete
        ) {
            return -1;
        }

        if (
            !aComplete &&
            bComplete
        ) {
            return 1;
        }

        if (
            a.missingItems !==
            b.missingItems
        ) {
            return (
                a.missingItems -
                b.missingItems
            );
        }

        return (
            a.total -
            b.total
        );
    });
}