import { getRecipeDetails, Recipe } from "@/lib/spoonacular";
import { getAiRecipeById, isAiRecipeId } from "@/lib/supabase-ai-recipes";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch meal details from either Spoonacular API or AI recipes table
 * @param mealId - The recipe ID
 * @param isAiGenerated - Optional flag from database indicating if recipe is AI-generated.
 *                        If provided, uses this instead of ID-based detection for reliability.
 */
export function useMealDetail(mealId: number | null, isAiGenerated?: boolean) {
  return useQuery<Recipe>({
    queryKey: ["meal-detail", mealId, isAiGenerated],
    queryFn: async () => {
      if (typeof mealId !== "number" || Number.isNaN(mealId)) {
        throw new Error("Missing meal identifier");
      }

      // Use the isAiGenerated flag if provided, otherwise fall back to ID-based detection
      const shouldFetchFromAi = isAiGenerated ?? isAiRecipeId(mealId);

      if (shouldFetchFromAi) {
        const aiRecipe = await getAiRecipeById(mealId);
        if (aiRecipe) {
          return aiRecipe;
        }
        // If AI recipe not found but flag was set, throw error
        if (isAiGenerated) {
          throw new Error("AI recipe not found");
        }
        // Otherwise, fall back to Spoonacular (in case of false positive ID detection)
      }

      // Fetch from Spoonacular API
      return getRecipeDetails(mealId);
    },
    enabled: typeof mealId === "number" && !Number.isNaN(mealId),
  });
}
