import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export function useDeleteMealItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealItemId: number) => {
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
