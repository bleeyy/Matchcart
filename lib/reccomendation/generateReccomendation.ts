import { Recommendation } from "@/types/reccomendation";

type GenerateRecommendationProps = {
  cheapestStore: string;
  cheapestTotal: number;
  mostExpensiveStore: string;
  savings: number;
};

export function generateRecommendation({
  cheapestStore,
  cheapestTotal,
  mostExpensiveStore,
  savings,
}: GenerateRecommendationProps): Recommendation {
  return {
    store: cheapestStore,
    total: cheapestTotal,
    savings,
    comparedTo: mostExpensiveStore,
    insights: [
      "Lowest overall cart total",
      `Save $${savings.toFixed(2)} compared to ${mostExpensiveStore}`,
      "Best value for your current shopping list",
    ],
  };
}