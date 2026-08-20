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
    <Card className="mt-6 space-y-5">

      <div className="flex items-center gap-2">
        <Trophy className="text-[#EF846C]" />

        <h2 className="text-xl font-bold text-[#191F24]">
          Best Value
        </h2>
      </div>


      <div>
        <p className="text-lg font-semibold text-[#3B4954]">
          {store}
        </p>

        <p className="text-3xl font-bold text-[#191F24]">
          ${total.toFixed(2)}
        </p>

        <p className="text-sm text-[#3B4954]">
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