import {
    createClient,
    createAdminClient,
} from "@/lib/supabase/server";

import type { Price } from "@/types/price";

export type MatchCartPrice = Price & {
    regularPrice: number | null;
    promoPrice: number | null;
    sizeId: number | null;
};

export async function getCurrentPrices(): Promise<
    MatchCartPrice[]
> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("prices")
        .select(`
            price,
            currency,
            source,
            updated_at,
            regular_price,
            promo_price,
            size_id,
            store_products!inner (
                product_id,
                store_id
            )
        `)
        .order("updated_at", {
            ascending: false,
        });

    if (error) {
        throw new Error(
            `Failed to fetch current prices: ${error.message}`
        );
    }

    const latestPrices = new Map<
        string,
        MatchCartPrice
    >();

    for (const row of data ?? []) {
        const storeProduct =
            Array.isArray(row.store_products)
                ? row.store_products[0]
                : row.store_products;

        if (!storeProduct) {
            continue;
        }

        const price: MatchCartPrice = {
            productId:
                storeProduct.product_id,

            storeId:
                storeProduct.store_id,

            price:
                Number(row.price),

            currency:
                row.currency,

            source:
                row.source,

            updatedAt:
                row.updated_at,

            regularPrice:
                row.regular_price !== null
                    ? Number(row.regular_price)
                    : null,

            promoPrice:
                row.promo_price !== null
                    ? Number(row.promo_price)
                    : null,

            sizeId:
                row.size_id,
        };

        const key = [
            price.storeId,
            price.productId,
            price.sizeId ?? "none",
        ].join(":");

        /*
         * Because prices are ordered newest first,
         * keep only the newest price for each
         * store/product/size combination.
         */
        if (!latestPrices.has(key)) {
            latestPrices.set(
                key,
                price
            );
        }
    }

    return Array.from(
        latestPrices.values()
    );
}

export async function saveRetailerPrice(
    productId: number,
    storeId: number,
    sizeId: number | null,
    retailerPrice: {
        externalProductId: string;
        productName: string;
        brand: string | null;
        price: number;
        regularPrice: number | null;
        promoPrice: number | null;
        currency: string;
        source: string;
        updatedAt: string;
    }
) {
    /*
     * Retailer price writes happen on the server,
     * so use the service-role client.
     */
    const supabase =
        createAdminClient();

    /*
     * Find the existing retailer product using
     * the database's unique:
     *
     * store_id + external_id
     */
    const {
        data: existingStoreProduct,
        error: lookupError,
    } = await supabase
        .from("store_products")
        .select("id, product_id")
        .eq(
            "store_id",
            storeId
        )
        .eq(
            "external_id",
            retailerPrice.externalProductId
        )
        .maybeSingle();

    if (lookupError) {
        throw new Error(
            `Failed to find store product: ${lookupError.message}`
        );
    }

    let storeProductId:
        | number
        | null =
        existingStoreProduct?.id ??
        null;

    /*
     * Existing retailer product.
     */
    if (existingStoreProduct) {
        /*
         * Keep the retailer product's information
         * up to date.
         */
        const {
            error: updateError,
        } = await supabase
            .from("store_products")
            .update({
                product_id:
                    productId,

                name:
                    retailerPrice.productName,

                brand:
                    retailerPrice.brand,
            })
            .eq(
                "id",
                existingStoreProduct.id
            );

        if (updateError) {
            throw new Error(
                `Failed to update store product: ${updateError.message}`
            );
        }
    }

    /*
     * No existing retailer product.
     * Create it.
     */
    if (!storeProductId) {
        const {
            data: newStoreProduct,
            error: insertError,
        } = await supabase
            .from("store_products")
            .insert({
                product_id:
                    productId,

                store_id:
                    storeId,

                external_id:
                    retailerPrice.externalProductId,

                name:
                    retailerPrice.productName,

                brand:
                    retailerPrice.brand,
            })
            .select("id")
            .single();

        if (insertError) {
            /*
             * Another request may have inserted the
             * same retailer product at the same time.
             */
            if (
                insertError.code ===
                "23505"
            ) {
                const {
                    data: concurrentProduct,
                    error:
                        concurrentLookupError,
                } = await supabase
                    .from("store_products")
                    .select("id")
                    .eq(
                        "store_id",
                        storeId
                    )
                    .eq(
                        "external_id",
                        retailerPrice.externalProductId
                    )
                    .maybeSingle();

                if (
                    concurrentLookupError ||
                    !concurrentProduct
                ) {
                    throw new Error(
                        `Failed to recover existing store product: ${
                            concurrentLookupError?.message ??
                            insertError.message
                        }`
                    );
                }

                storeProductId =
                    concurrentProduct.id;
            } else {
                throw new Error(
                    `Failed to create store product: ${insertError.message}`
                );
            }
        } else {
            storeProductId =
                newStoreProduct.id;
        }
    }

    /*
     * At this point a store product ID must exist.
     */
    if (!storeProductId) {
        throw new Error(
            "Store product ID was not available when saving retailer price."
        );
    }

    /*
     * Find an existing price for this exact
     * store product + size combination.
     *
     * IMPORTANT:
     *
     * Supabase/Postgres treats NULL specially,
     * so we cannot use .eq("size_id", null).
     *
     * For null sizes we use .is("size_id", null).
     */
    let existingPriceQuery =
        supabase
            .from("prices")
            .select("id")
            .eq(
                "store_product_id",
                storeProductId
            );

    if (sizeId === null) {
        existingPriceQuery =
            existingPriceQuery.is(
                "size_id",
                null
            );
    } else {
        existingPriceQuery =
            existingPriceQuery.eq(
                "size_id",
                sizeId
            );
    }

    const {
        data: existingPrice,
        error: existingPriceError,
    } = await existingPriceQuery
        .order("updated_at", {
            ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (existingPriceError) {
        throw new Error(
            `Failed to find existing retailer price: ${existingPriceError.message}`
        );
    }

    /*
     * If a price already exists for this exact
     * store product + size, update it instead
     * of inserting another row.
     */
    if (existingPrice) {
        const {
            error: updatePriceError,
        } = await supabase
            .from("prices")
            .update({
                price:
                    retailerPrice.price,

                currency:
                    retailerPrice.currency,

                source:
                    retailerPrice.source,

                updated_at:
                    retailerPrice.updatedAt,

                regular_price:
                    retailerPrice.regularPrice,

                promo_price:
                    retailerPrice.promoPrice,

                size_id:
                    sizeId,
            })
            .eq(
                "id",
                existingPrice.id
            );

        if (updatePriceError) {
            throw new Error(
                `Failed to update retailer price: ${updatePriceError.message}`
            );
        }

        return storeProductId;
    }

    /*
     * No existing price was found, so create
     * the first price for this combination.
     */
    const {
        error: priceError,
    } = await supabase
        .from("prices")
        .insert({
            store_product_id:
                storeProductId,

            price:
                retailerPrice.price,

            currency:
                retailerPrice.currency,

            source:
                retailerPrice.source,

            updated_at:
                retailerPrice.updatedAt,

            regular_price:
                retailerPrice.regularPrice,

            promo_price:
                retailerPrice.promoPrice,

            size_id:
                sizeId,
        });

    if (priceError) {
        /*
         * A second request may have inserted the
         * price between our lookup and insert.
         *
         * If that happens, update the existing row
         * instead of failing the comparison.
         */
        if (
            priceError.code ===
            "23505"
        ) {
            let concurrentPriceQuery =
                supabase
                    .from("prices")
                    .select("id")
                    .eq(
                        "store_product_id",
                        storeProductId
                    );

            if (sizeId === null) {
                concurrentPriceQuery =
                    concurrentPriceQuery.is(
                        "size_id",
                        null
                    );
            } else {
                concurrentPriceQuery =
                    concurrentPriceQuery.eq(
                        "size_id",
                        sizeId
                    );
            }

            const {
                data: concurrentPrice,
                error:
                    concurrentPriceLookupError,
            } =
                await concurrentPriceQuery
                    .order(
                        "updated_at",
                        {
                            ascending:
                                false,
                        }
                    )
                    .limit(1)
                    .maybeSingle();

            if (
                concurrentPriceLookupError ||
                !concurrentPrice
            ) {
                throw new Error(
                    `Failed to recover existing retailer price: ${
                        concurrentPriceLookupError?.message ??
                        priceError.message
                    }`
                );
            }

            const {
                error:
                    concurrentUpdateError,
            } = await supabase
                .from("prices")
                .update({
                    price:
                        retailerPrice.price,

                    currency:
                        retailerPrice.currency,

                    source:
                        retailerPrice.source,

                    updated_at:
                        retailerPrice.updatedAt,

                    regular_price:
                        retailerPrice.regularPrice,

                    promo_price:
                        retailerPrice.promoPrice,

                    size_id:
                        sizeId,
                })
                .eq(
                    "id",
                    concurrentPrice.id
                );

            if (concurrentUpdateError) {
                throw new Error(
                    `Failed to update concurrent retailer price: ${concurrentUpdateError.message}`
                );
            }

            return storeProductId;
        }

        throw new Error(
            `Failed to save retailer price: ${priceError.message}`
        );
    }

    return storeProductId;
}