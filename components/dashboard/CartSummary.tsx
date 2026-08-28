import Card from "@/components/ui/Card";
import { Trophy, PiggyBank } from "lucide-react";

type CartSummaryProps = {
  store: string;
  total: number;
  savings: number;
  comparedTo: string;
  itemCount: number;
  dataStatus: "sample" | "live";
};


export default function CartSummary({
  store,
  total,
  savings,
  comparedTo,
  itemCount,
  dataStatus,
}: CartSummaryProps) {
  return (
    <Card className="comparison-reveal mt-6 space-y-5 border-[#ee806c]/35 bg-[#fff8f1]">

      <div className="flex items-center gap-2">
        <Trophy className="text-[#d75e55]" />

        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#243239]">
          Your best basket
        </h2>
      </div>


      <div>
        <p className="text-lg font-bold text-[#3f594a]">
          {store}
        </p>

        <p className="font-[family-name:var(--font-display)] text-4xl text-[#243239]">
          ${total.toFixed(2)}
        </p>

        <p className="text-sm text-[#68736f]">
          Estimated total for {itemCount} items
        </p>

        <p className="text-xs text-[#3B4954]/70">
          {dataStatus === "live"
            ? "Prices from connected retailers"
            : "Using sample pricing data"}
        </p>      </div>


      {savings > 0 && (
        <div className="flex items-center gap-2 text-[#EF846C]">
          <PiggyBank />

          <p className="font-bold">
            Save ${savings.toFixed(2)} compared to {comparedTo}
          </p>
        </div>
      )}


      <div className="space-y-2">
        <h3 className="font-semibold text-[#191F24]">
          Why this recommendation
        </h3>

        <ul className="space-y-1 text-sm text-[#3B4954]">
          <li>
            ✓ Lowest overall cart total
          </li>

          <li>
            ✓ Saves ${savings.toFixed(2)} compared to {comparedTo}
          </li>

          <li>
            ✓ Best option for your current shopping list
          </li>
        </ul>
      </div>

    </Card>
  );
}