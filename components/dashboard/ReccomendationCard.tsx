type RecommendationCardProps = {
  cheapestStore: string;
  cheapestTotal: number;
  mostExpensiveStore: string;
  savings: number;
};

export default function RecommendationCard({
  cheapestStore,
  cheapestTotal,
  mostExpensiveStore,
  savings,
}: RecommendationCardProps) {
  if (savings <= 0) {
    return null;
  }

  return (
    <div className="mt-4 border rounded-xl p-5 bg-green-50">
      <h2 className="text-lg font-bold text-black">
        💡 MatchCart Recommendation
      </h2>

        <p className="text-black mt-2">
          Shop at{" "}
          <span className="font-bold">
              {cheapestStore}
          </span>
        </p>

        <p className="text-black mt-2">
          Cart total:
           <span className="font-bold">
              {" "}${cheapestTotal.toFixed(2)}
          </span>
        </p>
        <p className="text-green-700 font-bold mt-2">
          💰 Save ${savings.toFixed(2)} compared to {mostExpensiveStore}
        </p>
        <p className="text-gray-600 text-sm mt-2">
           {cheapestStore} is the cheapest option for your cart.
        </p>
    </div>
  );
}