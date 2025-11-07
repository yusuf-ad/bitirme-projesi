export interface Meal {
  id: number;
  title: string;
  readyInMinutes?: number;
  servings?: number;
  imageType?: string;
  image?: string;
  sourceUrl?: string;
  nutrition?: {
    calories?: number;
    carbs?: number;
    fat?: number;
    protein?: number;
  };
}

export interface MealTypeData {
  results: Meal[];
  totalResults: number;
}

export interface MealPlan {
  breakfast: MealTypeData;
  lunch: MealTypeData;
  dinner: MealTypeData;
}

export type MealType = "breakfast" | "lunch" | "dinner";

export interface MealItem {
  spoonacular_recipe_id: number;
  recipe_name: string;
  recipe_image_url: string;
  calories_per_serving?: number;
  ready_in_minutes?: number;
  meal_date: string;
  meal_type: MealType;
}

/**
 * Get the full image URL for a meal from Spoonacular API
 * @param meal - The meal object containing image information
 * @returns Full image URL string
 */
export const getMealImageUrl = (meal: Meal): string => {
  // First check if there's a direct image property from API
  if (meal.image) {
    // If it's already a full URL
    if (meal.image.startsWith("http")) {
      return meal.image;
    }
    // If it's just filename, construct URL
    return `https://spoonacular.com/recipeImages/${meal.image}`;
  }
  // Fallback to constructing URL from id
  if (meal.id) {
    return `https://spoonacular.com/recipeImages/${meal.id}-312x231.jpg`;
  }
  return "";
};

/**
 * Create a meal item object from meal plan data
 * @param mealPlan - The complete meal plan data
 * @param mealType - Type of meal (breakfast, lunch, or dinner)
 * @param selectedIndex - Index of the selected meal in the results array
 * @returns Meal item object or null if meal not found
 */
export const createMealItem = (
  mealPlan: MealPlan | undefined,
  mealType: MealType,
  selectedIndex: number,
  mealDate: Date
): MealItem | null => {
  const selectedMeal = mealPlan?.[mealType].results[selectedIndex];

  if (!selectedMeal) return null;

  const normalizedDate = new Date(mealDate);
  normalizedDate.setHours(0, 0, 0, 0);

  return {
    spoonacular_recipe_id: selectedMeal.id,
    recipe_name: selectedMeal.title,
    recipe_image_url: getMealImageUrl(selectedMeal),
    calories_per_serving: selectedMeal.nutrition?.calories,
    ready_in_minutes: selectedMeal.readyInMinutes,
    meal_date: `${normalizedDate.getFullYear()}-${String(
      normalizedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(normalizedDate.getDate()).padStart(2, "0")}`,
    meal_type: mealType,
  };
};
