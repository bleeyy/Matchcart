import { Recommendation } from "@/types/reccomendation";

type GenerateRecommendationProps = {
    cheapestStore: string;
    cheapestTotal: number;
    mostExpensiveStore: string;
    savings: number;
    itemCount: number;
};

export function generateRecommendation({
  cheapestStore,
  cheapestTotal,
  mostExpensiveStore,
  savings,
  itemCount,
}: GenerateRecommendationProps): Recommendation {
    const insights: string[] = [];

    insights.push("Lowest overall cart total");

    insights.push(
        `Save $${savings.toFixed(2)} compared to ${mostExpensiveStore}`
    );

    insights.push(
        `Cheapest on your ${itemCount}-item shopping list`
    );

  return {
    store: cheapestStore,
    total: cheapestTotal,
    savings,
    comparedTo: mostExpensiveStore,
    insights,
  };
}