import { createClient } from "@/lib/supabase/server";

export type MatchCartPrice = {
  productId: number;
  storeId: number;
  price: number;
  currency: string;
  source: string;
  updatedAt: string;
  regularPrice: number | null;
  promoPrice: number | null;
};

export async function getCurrentPrices(): Promise<MatchCartPrice[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prices")
    .select(`
      id,
      price,
      currency,
      source,
      updated_at,
      regular_price,
      promo_price,
      store_products (
        product_id,
        store_id
      )
    `);

  if (error) {
    throw new Error(
      `Failed to fetch current prices: ${error.message}`
    );
  }

  return (data ?? [])
    .map((row) => {
      const storeProduct = row.store_products?.[0];

      if (!storeProduct) {
        return null;
      }

      return {
        productId: storeProduct.product_id,
        storeId: storeProduct.store_id,
        price: row.price,
        currency: row.currency,
        source: row.source,
        updatedAt: row.updated_at,
        regularPrice: row.regular_price,
        promoPrice: row.promo_price,
      };
    })
    .filter(
      (price): price is MatchCartPrice =>
        price !== null
    );
}