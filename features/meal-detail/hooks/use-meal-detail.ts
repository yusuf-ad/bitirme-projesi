import { getRecipeDetails, Recipe } from "@/lib/spoonacular";
import { getAiRecipeById, isAiRecipeId } from "@/lib/supabase-ai-recipes";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch meal details from either Spoonacular API or AI recipes table
 * @param mealId - The recipe ID
 */
export function useMealDetail(mealId: number | null) {
  return useQuery<Recipe>({
    queryKey: ["meal-detail", mealId],
    queryFn: async () => {
      if (typeof mealId !== "number" || Number.isNaN(mealId)) {
        throw new Error("Missing meal identifier");
      }

      // Use ID-based detection to determine if recipe is AI-generated
      const shouldFetchFromAi = isAiRecipeId(mealId);

      if (shouldFetchFromAi) {
        const aiRecipe = await getAiRecipeById(mealId);
        if (aiRecipe) {
          return aiRecipe;
        }
        // Fall back to Spoonacular (in case of false positive ID detection)
      }

      // Fetch from Spoonacular API
      return getRecipeDetails(mealId);
    },
    enabled: typeof mealId === "number" && !Number.isNaN(mealId),
  });
}
