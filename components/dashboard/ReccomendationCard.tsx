import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Recommendation } from "@/types/reccomendation";

type RecommendationCardProps = {
  recommendation: Recommendation;
};

export default function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const {
  store,
  total,
  savings,
  comparedTo,
  insights,
} = recommendation;
  if (savings <= 0) {
    return null;
  }

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <Badge>
          Best Value
        </Badge>

        <h2 className="text-2xl font-bold text-[#191F24]">
          Best Choice
        </h2>

        <p className="text-lg font-semibold text-[#3B4954]">
          {store}
        </p>
        <hr className="border-[#DFDCCD]" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#3B4954]">
              Estimated Total
            </p>

            <p className="text-2xl font-bold text-[#191F24]">
              ${total.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-sm text-[#3B4954]">
              You Save
            </p>

            <p className="text-2xl font-bold text-[#EF846C]">
              ${savings.toFixed(2)}
            </p>
          </div>
        </div>
        <hr className="border-[#DFDCCD]" />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#3B4954]">
            Why we recommend {store}
          </h3>
          <ul className="space-y-2 text-[#191F24]">
            {insights.map((insight) => (
              <li key={insight}>
                • {insight}
              </li>
            ))}
          </ul>
        </div>
        <Button className="w-full">
          View Full Comparison
        </Button>
      </div>
    </Card>
  );
}