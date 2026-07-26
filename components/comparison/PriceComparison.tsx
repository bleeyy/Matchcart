import { StoreTotal } from "@/lib/comparison/calculateTotals";

export type PriceComparisonProps = {
  totals: StoreTotal[];
};

export default function PriceComparison({
  totals,
}: PriceComparisonProps) {
  if (totals.length === 0) {
    return null;
  }

    const cheapest = totals[0];

    const mostExpensive = totals[totals.length - 1];

    const savings = mostExpensive.total - cheapest.total;

  return (
    <div className="mt-6 border rounded-xl p-5 bg-gray-50">
      <h2 className="text-xl font-bold text-black mb-3">
        🏆 Best Store
      </h2>

      <div className="text-black">
        <p className="text-2xl font-bold">
          {cheapest.storeName}
        </p>

        <p className="text-lg">
          ${cheapest.total.toFixed(2)}
        </p>
              {savings > 0 && (
                  <p className="text-green-600 mt-2">
                      💰 You save ${savings.toFixed(2)} compared to {mostExpensive.storeName} !
                  </p>
              )}
      </div>

      <div className="mt-4 space-y-2">
        {totals.map((store, index) => (
          <div
            key={store.storeId}
            className="flex justify-between text-black"
          >
            <span>
              {index + 1}. {store.storeName}
            </span>

            <span>
              ${store.total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}