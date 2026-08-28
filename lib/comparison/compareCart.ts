import { CartItem } from "@/types/cart";
import { calculateTotals } from "@/lib/comparison/calculateTotals";
import { getCurrentPrices } from "@/lib/data/priceRepository";

export async function compareCart(
  cart: CartItem[],
  selectedStoreIds: number[]
) {
  if (cart.length === 0) {
    return { totals: [], prices: [] };
  }

  if (selectedStoreIds.length === 0) {
    return { totals: [], prices: [] };
  }

  /*
   * Get the current prices directly from Supabase.
   */
  const currentPrices = await getCurrentPrices();

  /*
   * Only use prices belonging to
   * stores selected by the user.
   */
  const comparisonPrices = currentPrices.filter((price) =>
    selectedStoreIds.includes(price.storeId)
  );

  /*
   * Calculate totals using the
   * Supabase prices.
   */
  const totals = calculateTotals(cart, selectedStoreIds, comparisonPrices);

  return {
    totals,
    prices: comparisonPrices,
  };
}