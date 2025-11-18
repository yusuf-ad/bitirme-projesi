import { getRecipeDetails, Recipe } from "@/lib/spoonacular";
import { useQuery } from "@tanstack/react-query";

export function useMealDetail(mealId: number | null) {
  return useQuery<Recipe>({
    queryKey: ["meal-detail", mealId],
    queryFn: async () => {
      if (typeof mealId !== "number" || Number.isNaN(mealId)) {
        throw new Error("Missing meal identifier");
      }

      return getRecipeDetails(mealId);
    },
    enabled: typeof mealId === "number" && !Number.isNaN(mealId),
  });
}
