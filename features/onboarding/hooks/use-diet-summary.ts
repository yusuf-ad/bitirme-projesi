import { useQuery } from "@tanstack/react-query";
import { generateMealPlan, MealPlanNutrients } from "@/lib/spoonacular";

interface UseDietSummaryParams {
  spoonacularDiet?: string;
  targetCalories?: number;
  enabled?: boolean;
}

export function useDietSummary({
  spoonacularDiet,
  targetCalories,
  enabled = true,
}: UseDietSummaryParams) {
  return useQuery<MealPlanNutrients>({
    queryKey: [
      "diet-summary",
      spoonacularDiet ?? "all",
      targetCalories ?? "auto",
    ],
    queryFn: async () => {
      const response = await generateMealPlan({
        diet: spoonacularDiet,
        targetCalories,
        timeFrame: "day",
      });
      return response.nutrients;
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

