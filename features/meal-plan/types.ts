export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export type MealType = "breakfast" | "lunch" | "dinner";

export interface MealTypeOption {
  id: MealType;
  label: string;
}

export interface Meal {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes?: number;
  nutrition?: {
    nutrients?: {
      name: string;
      amount: number;
      unitShort: string;
    }[];
    calories?: number;
    carbs?: number;
    fat?: number;
    protein?: number;
  };
  summary?: string;
}

export interface MealPlanData {
  results: Meal[];
  totalResults: number;
}

export interface GeneratedMealPlan {
  breakfast: MealPlanData;
  lunch: MealPlanData;
  dinner: MealPlanData;
}

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
  carbs_per_serving: number | null;
  protein_per_serving: number | null;
  fat_per_serving: number | null;
  ready_in_minutes: number | null;
  meal_date: string;
  meal_type: MealSlot;
  is_ai_generated: boolean;
}
