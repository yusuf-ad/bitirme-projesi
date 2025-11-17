import type { MealPlanItemRecord, MealPlanRecord } from "@/features/meal-plan";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

interface FetchMealsResult {
  plan: MealPlanRecord | null;
  items: MealPlanItemRecord[];
}

const formatDateForQuery = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useMealPlansQuery(
  userId: string | undefined,
  selectedDate: Date
) {
  const fetchMealsForDate = useCallback(async (): Promise<FetchMealsResult> => {
    if (!userId) {
      return { plan: null, items: [] };
    }

    const dateString = formatDateForQuery(selectedDate);

    // Fetch the active meal plan for the selected date
    const { data: plans, error: planError } = await supabase
      .from("meal_plans")
      .select("id, user_id, name, start_date, end_date")
      .eq("user_id", userId)
      .lte("start_date", dateString)
      .gte("end_date", dateString)
      .order("start_date", { ascending: false })
      .limit(1);

    if (planError) {
      throw planError;
    }

    if (!plans || plans.length === 0) {
      return { plan: null, items: [] };
    }

    const plan = plans[0];

    // Fetch the meals for the selected date
    const { data: items, error: itemsError } = await supabase
      .from("meal_plan_items")
      .select(
        "id, meal_plan_id, spoonacular_recipe_id, recipe_name, recipe_image_url, calories_per_serving, carbs_per_serving, protein_per_serving, fat_per_serving, ready_in_minutes, meal_date, meal_type"
      )
      .eq("meal_plan_id", plan.id)
      .eq("meal_date", dateString)
      .order("meal_type", { ascending: true });

    if (itemsError) {
      throw itemsError;
    }

    return { plan, items: items ?? [] };
  }, [userId, selectedDate]);

  return useQuery({
    queryKey: ["meal-plans", userId, formatDateForQuery(selectedDate)],
    queryFn: fetchMealsForDate,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}
