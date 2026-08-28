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
            store_products!inner (
                product_id,
                store_id,
                variant_id,
                size_id
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
                null,

            promoPrice:
                null,

            sizeId:
                storeProduct.size_id,
        };

        const key = [
            price.storeId,
            price.productId,
            storeProduct.variant_id ?? "none",
            price.sizeId ?? "none",
        ].join(":");

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
    variantId: number | null,
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
    const supabase =
        createAdminClient();

    const {
        data: existingStoreProduct,
        error: lookupError,
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

    if (existingStoreProduct) {
        const {
            error: updateError,
        } = await supabase
            .from("store_products")
            .update({
                product_id:
                    productId,

                variant_id:
                    variantId,

                size_id:
                    sizeId,

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

                variant_id:
                    variantId,

                size_id:
                    sizeId,

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

    if (!storeProductId) {
        throw new Error(
            "Store product ID was not available when saving retailer price."
        );
    }

    const {
        data: existingPrice,
        error: existingPriceError,
    } = await supabase
        .from("prices")
        .select("id")
        .eq(
            "store_product_id",
            storeProductId
        )
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
    } else {
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
            });

        if (priceError) {
            if (
                priceError.code ===
                "23505"
            ) {
                const {
                    data: concurrentPrice,
                    error:
                        concurrentPriceLookupError,
                } = await supabase
                    .from("prices")
                    .select("id")
                    .eq(
                        "store_product_id",
                        storeProductId
                    )
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
            } else {
                throw new Error(
                    `Failed to save retailer price: ${priceError.message}`
                );
            }
        }
    }

    const {
        error: historyError,
    } = await supabase
        .from("price_history")
        .insert({
            store_product_id:
                storeProductId,

            price:
                retailerPrice.price,

            regular_price:
                retailerPrice.regularPrice,

            promo_price:
                retailerPrice.promoPrice,

            currency:
                retailerPrice.currency,

            source:
                retailerPrice.source,

            recorded_at:
                retailerPrice.updatedAt,
        });

    if (historyError) {
        throw new Error(
            `Failed to save price history: ${historyError.message}`
        );
    }

    return storeProductId;
}