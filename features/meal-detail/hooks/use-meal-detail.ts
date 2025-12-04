import { getRecipeDetails, Recipe } from "@/lib/spoonacular";
import { getAiRecipeById, isAiRecipeId } from "@/lib/supabase-ai-recipes";
import { useQuery } from "@tanstack/react-query";

export function useMealDetail(mealId: number | null) {
  return useQuery<Recipe>({
    queryKey: ["meal-detail", mealId],
    queryFn: async () => {
      if (typeof mealId !== "number" || Number.isNaN(mealId)) {
        throw new Error("Missing meal identifier");
      }

      // Check if this is an AI-generated recipe (ID >= 900000)
      if (isAiRecipeId(mealId)) {
        const aiRecipe = await getAiRecipeById(mealId);
        if (aiRecipe) {
          return aiRecipe;
        }
        throw new Error("AI recipe not found");
      }

      // Otherwise, fetch from Spoonacular API
      return getRecipeDetails(mealId);
    },
    enabled: typeof mealId === "number" && !Number.isNaN(mealId),
  });
}
