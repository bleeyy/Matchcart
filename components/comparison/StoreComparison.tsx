import { StoreTotal } from "@/lib/comparison/calculateTotals";

type StoreComparisonProps = {
  storeTotals: StoreTotal[];
};

export default function StoreComparison({
  storeTotals,
}: StoreComparisonProps) {

  const cheapestTotal = Math.min(
    ...storeTotals.map((store) => store.total)
  );


  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-black mb-3">
        Store Comparison
      </h2>

      <div className="space-y-2">
        {storeTotals.map((store, index) => (
          <div
            key={store.storeName}
            className={`flex justify-between border rounded-lg p-3 ${store.total === cheapestTotal
              ? "border-green-500 bg-green-50"
              : ""
              }`}
          >
            <div>
              <p className="font-semibold text-[#191F24]">
                {index + 1}. {store.storeName}
              </p>

              {index === 0 ? (
                <p className="text-sm text-green-700">
                  Lowest Total
                </p>
              ) : (
                <p className="text-sm text-[#3B4954]">
                  +${(store.total - cheapestTotal).toFixed(2)}
                </p>
              )}
            </div>
            <span className="font-bold text-black">
              ${store.total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}