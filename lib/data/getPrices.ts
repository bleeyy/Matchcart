import { createClient } from "@/lib/supabase/server";

export async function getPrices() {
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
    throw new Error(`Failed to fetch prices: ${error.message}`);
  }

  return data ?? [];
}