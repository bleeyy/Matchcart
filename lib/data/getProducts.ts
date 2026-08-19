import { createClient } from "@/lib/supabase/server";

export async function getProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, category")
    .order("id");

  if (error) {
    throw new Error(
      `Failed to fetch products: ${error.message}`
    );
  }

  return data ?? [];
}