import {
  createAdminClient,
} from "@/lib/supabase/server";

import type { Price } from "@/types/price";

export type MatchCartPrice = Price & {
  regularPrice: number | null;
  promoPrice: number | null;
  sizeId: number | null;
  variantId: number | null;
};

export async function getCurrentPrices(): Promise<
  MatchCartPrice[]
> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.warn(
      "Supabase admin credentials are unavailable; rendering without current prices."
    );

    return [];
  }

  const supabase = createAdminClient();

  /*
   * Supabase limits a single query to 1,000 rows.
   *
   * Our database contains thousands of prices, so we
   * fetch them in batches.
   */
  const PAGE_SIZE = 1000;

  const allPriceRows: {
    id: number;
    store_product_id: number;
    price: number;
    regular_price: number | null;
    promo_price: number | null;
    currency: string;
    source: string;
    updated_at: string;
  }[] = [];

  let from = 0;

  while (true) {
    const {
      data: priceRows,
      error: priceError,
    } = await supabase
      .from("prices")
      .select(
        `
          id,
          store_product_id,
          price,
          regular_price,
          promo_price,
          currency,
          source,
          updated_at
        `
      )
      .order("updated_at", {
        ascending: false,
      })
      .range(
        from,
        from + PAGE_SIZE - 1
      );

    if (priceError) {
      throw new Error(
        `Failed to fetch prices: ${priceError.message}`
      );
    }

    if (
      !priceRows ||
      priceRows.length === 0
    ) {
      break;
    }

    allPriceRows.push(
      ...priceRows
    );

    console.log(
      `Loaded ${priceRows.length} prices (${allPriceRows.length} total)`
    );

    /*
     * If fewer than PAGE_SIZE rows were returned,
     * we've reached the end.
     */
    if (
      priceRows.length <
      PAGE_SIZE
    ) {
      break;
    }

    from += PAGE_SIZE;
  }

  if (allPriceRows.length === 0) {
    console.log(
      "Supabase returned 0 rows from prices table."
    );

    return [];
  }

  console.log(
    `Supabase returned ${allPriceRows.length} total price rows.`
  );

  /*
   * Get all store_product IDs referenced by the prices.
   */
  const storeProductIds = [
    ...new Set(
      allPriceRows
        .map(
          (row) =>
            row.store_product_id
        )
        .filter(
          (
            id
          ): id is number =>
            typeof id ===
            "number"
        )
    ),
  ];

  /*
   * Supabase also limits this .in() query if we
   * send thousands of IDs at once.
   *
   * Fetch store_products in batches too.
   */
  const storeProducts: {
    id: number;
    store_id: number;
    product_id: number;
    variant_id: number | null;
    size_id: number | null;
  }[] = [];

  for (
    let i = 0;
    i < storeProductIds.length;
    i += PAGE_SIZE
  ) {
    const batch =
      storeProductIds.slice(
        i,
        i + PAGE_SIZE
      );

    const {
      data,
      error:
        storeProductError,
    } = await supabase
      .from("store_products")
      .select(
        `
          id,
          store_id,
          product_id,
          variant_id,
          size_id
        `
      )
      .in("id", batch);

    if (storeProductError) {
      throw new Error(
        `Failed to fetch store products: ${storeProductError.message}`
      );
    }

    if (data) {
      storeProducts.push(
        ...data
      );
    }
  }

  console.log(
    `Supabase returned ${storeProducts.length} matching store_products.`
  );

  /*
   * Create:
   *
   * store_product_id -> store_product
   */
  const storeProductMap =
    new Map<
      number,
      {
        id: number;
        store_id: number;
        product_id: number;
        variant_id: number | null;
        size_id: number | null;
      }
    >();

  for (
    const storeProduct of
    storeProducts
  ) {
    storeProductMap.set(
      storeProduct.id,
      storeProduct
    );
  }

  /*
   * Build final MatchCartPrice objects.
   */
  const latestPrices =
    new Map<
      string,
      MatchCartPrice
    >();

  for (
    const row of allPriceRows
  ) {
    const storeProduct =
      storeProductMap.get(
        row.store_product_id
      );

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
        row.regular_price == null
          ? null
          : Number(
              row.regular_price
            ),

      promoPrice:
        row.promo_price == null
          ? null
          : Number(
              row.promo_price
            ),

      sizeId:
        storeProduct.size_id,

      variantId:
        storeProduct.variant_id,
    };

    const key = [
      price.storeId,
      price.productId,
      price.variantId ??
        "none",
      price.sizeId ??
        "none",
    ].join(":");

    /*
     * Because the rows are ordered newest first,
     * the first row for each combination is the
     * current price.
     */
    if (
      !latestPrices.has(key)
    ) {
      latestPrices.set(
        key,
        price
      );
    }
  }

  const result =
    Array.from(
      latestPrices.values()
    );

  /*
   * Debugging.
   */
  console.log(
    "========== MATCHCART SUPABASE PRICES =========="
  );

  console.log(
    "Total final prices:",
    result.length
  );

  console.log(
    "Milk prices:",
    result
      .filter(
        (price) =>
          price.productId === 1
      )
      .slice(0, 4)
  );

  console.log(
    "Banana prices:",
    result
      .filter(
        (price) =>
          price.productId === 75
      )
      .slice(0, 10)
  );

  console.log(
    "Regular 1 lb banana prices:",
    result.filter(
      (price) =>
        price.productId === 75 &&
        price.variantId ===
          20281 &&
        price.sizeId ===
          10623
    )
  );

  console.log(
    "==============================================="
  );

  return result;
}

/*
 * Saves or updates a retailer product and
 * its current price in Supabase.
 */
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

        updated_at:
          retailerPrice.updatedAt,
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

        updated_at:
          retailerPrice.updatedAt,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(
        `Failed to create store product: ${insertError.message}`
      );
    }

    storeProductId =
      newStoreProduct.id;
  }

  if (!storeProductId) {
    throw new Error(
      "Store product ID was not available."
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
      `Failed to find existing price: ${existingPriceError.message}`
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

        regular_price:
          retailerPrice.regularPrice,

        promo_price:
          retailerPrice.promoPrice,

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
        `Failed to update price: ${updatePriceError.message}`
      );
    }
  } else {
    const {
      error: insertPriceError,
    } = await supabase
      .from("prices")
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

        updated_at:
          retailerPrice.updatedAt,
      });

    if (insertPriceError) {
      throw new Error(
        `Failed to save price: ${insertPriceError.message}`
      );
    }
  }

  return storeProductId;
}