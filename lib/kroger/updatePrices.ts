import { createAdminClient } from "@/lib/supabase/admin";
import {
  getKrogerProduct,
  searchKrogerProducts,
  type KrogerProduct,
} from "./products";

type MatchCartProduct = {
  id: number;
  name: string;
};

function getEffectivePrice(product: KrogerProduct) {
  const item = product.items?.find(
    (item) =>
      item.price?.promo !== undefined ||
      item.price?.regular !== undefined
  );

  if (!item?.price) {
    return null;
  }

  const regularPrice = item.price.regular ?? null;
  const promoPrice = item.price.promo ?? null;

  const effectivePrice = promoPrice ?? regularPrice;

  if (effectivePrice === null) {
    return null;
  }

  return {
    effectivePrice,
    regularPrice,
    promoPrice,
  };
}

function chooseBestMatch(
  searchTerm: string,
  products: KrogerProduct[]
) {
  const normalizedSearch = searchTerm.toLowerCase().trim();

  return (
    products.find((product) =>
      product.description
        ?.toLowerCase()
        .includes(normalizedSearch)
    ) ?? products[0]
  );
}

export async function updateKrogerPrices(
  products: MatchCartProduct[]
) {
  const locationId = process.env.KROGER_LOCATION_ID;

  if (!locationId) {
    throw new Error("Missing KROGER_LOCATION_ID.");
  }

  const supabase = createAdminClient();

  const results = [];
  const failures = [];

  console.log("Products received:", products.length);
  console.log("Kroger location:", locationId);

  for (const product of products) {
    try {
      console.log(`\n--- Processing ${product.name} ---`);

      const searchResults = await searchKrogerProducts(
        product.name,
        locationId
      );

      console.log(
        `Kroger search returned ${searchResults.length} results`
      );

      if (searchResults.length === 0) {
        failures.push({
          product: product.name,
          reason: "No Kroger search results",
        });
        continue;
      }

      const match = chooseBestMatch(
        product.name,
        searchResults
      );

      console.log("Selected Kroger product:", {
        productId: match.productId,
        description: match.description,
        brand: match.brand,
      });

      const exactProduct = await getKrogerProduct(
        match.productId,
        locationId
      );

      if (!exactProduct) {
        failures.push({
          product: product.name,
          reason: "Could not retrieve exact Kroger product",
        });
        continue;
      }

      const priceData = getEffectivePrice(exactProduct);

      console.log("Price data:", priceData);

      if (!priceData) {
        failures.push({
          product: product.name,
          reason: "Kroger product has no price",
        });
        continue;
      }

      const { data: storeProduct, error: storeProductError } =
        await supabase
          .from("store_products")
          .select("id")
          .eq("product_id", product.id)
          .eq("store_id", 4)
          .maybeSingle();

      if (storeProductError) {
        failures.push({
          product: product.name,
          reason: `store_products lookup failed: ${storeProductError.message}`,
        });
        continue;
      }

      console.log("Existing store product:", storeProduct);

      if (!storeProduct) {
        failures.push({
          product: product.name,
          reason: "No store_products row for Kroger",
        });
        continue;
      }

      const { error: productUpdateError } = await supabase
        .from("store_products")
        .update({
          external_id: exactProduct.productId,
          name: exactProduct.description ?? product.name,
          brand: exactProduct.brand ?? null,
        })
        .eq("id", storeProduct.id);

      if (productUpdateError) {
        failures.push({
          product: product.name,
          reason: `store_products update failed: ${productUpdateError.message}`,
        });
        continue;
      }

      const { error: priceError } = await supabase
        .from("prices")
        .upsert(
          {
            store_product_id: storeProduct.id,
            price: priceData.effectivePrice,
            regular_price: priceData.regularPrice,
            promo_price: priceData.promoPrice,
            currency: "USD",
            source: "kroger-api",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "store_product_id",
          }
        );

      if (priceError) {
        failures.push({
          product: product.name,
          reason: `prices upsert failed: ${priceError.message}`,
        });
        continue;
      }

      results.push({
        productId: product.id,
        name: exactProduct.description ?? product.name,
        krogerProductId: exactProduct.productId,
        price: priceData.effectivePrice,
        regularPrice: priceData.regularPrice,
        promoPrice: priceData.promoPrice,
      });

      console.log(
        `SUCCESS: ${product.name} -> $${priceData.effectivePrice.toFixed(2)}`
      );
    } catch (error) {
      failures.push({
        product: product.name,
        reason:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }

  return {
    results,
    failures,
  };
}