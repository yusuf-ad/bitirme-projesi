export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealPlanRecord {
  id: number;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface MealPlanItemRecord {
  id: number;
  meal_plan_id: number;
  spoonacular_recipe_id: number;
  recipe_name: string;
  recipe_image_url: string | null;
  calories_per_serving: number | null;
  ready_in_minutes: number | null;
  meal_date: string;
  meal_type: MealSlot;
}
