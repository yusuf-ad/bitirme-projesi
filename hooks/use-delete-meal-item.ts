import {
  MealPlanItemRecord,
  mealPlanIngredientsService,
} from "@/features/meal-plan";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export function useDeleteMealItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealItemId: number) => {
      // 1. Get the item details before deleting
      const { data: item, error: fetchError } = await supabase
        .from("meal_plan_items")
        .select("*")
        .eq("id", mealItemId)
        .single();

      if (fetchError) {
        // If we can't fetch it, we can't remove ingredients, but we should still try to delete
        console.error(
          "Error fetching meal item for ingredient removal:",
          fetchError
        );
      } else if (item) {
        // 2. Remove associated ingredients from shopping list
        try {
          await mealPlanIngredientsService.removeIngredientsFromShoppingList(
            item as MealPlanItemRecord
          );
        } catch (e) {
          console.warn("Failed to remove ingredients from shopping list", e);
          // Proceed with deletion anyway
        }
      }

      // 3. Delete the item
      const { error } = await supabase
        .from("meal_plan_items")
        .delete()
        .eq("id", mealItemId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate meal plans query to refetch
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
      // Invalidate pantry queries as we might have removed ingredients
      queryClient.invalidateQueries({ queryKey: ["pantry-items"] });
      queryClient.invalidateQueries({ queryKey: ["pantry"] });
    },
    onError: (error) => {
      console.error("Error deleting meal item:", error);
      Alert.alert(
        "Delete Error",
        "An error occurred while deleting the meal. Please try again."
      );
    },
  });
}
