import { MealPlanItemRecord } from "@/features/meal-plan";
import { PantryItem } from "@/features/pantry/types";
import { Recipe } from "@/lib/spoonacular";
import { searchRecipesComplex } from "@/lib/spoonacular-complex-search";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "./use-auth-context";
import { usePantryQuery } from "./use-pantry-query";

export interface SuggestedRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  calories: number;
  tag?: string;
  source: "pantry" | "recent" | "random";
}

// Get recent meals from the last 7 days
async function getRecentMeals(userId: string): Promise<MealPlanItemRecord[]> {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const { data: plans } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("user_id", userId);

  if (!plans || plans.length === 0) return [];

  const planIds = plans.map((p) => p.id);

  const { data: items } = await supabase
    .from("meal_plan_items")
    .select(
      "id, meal_plan_id, spoonacular_recipe_id, recipe_name, recipe_image_url, calories_per_serving, ready_in_minutes, meal_date, meal_type"
    )
    .in("meal_plan_id", planIds)
    .gte("meal_date", formatDate(weekAgo))
    .lte("meal_date", formatDate(today))
    .order("meal_date", { ascending: false })
    .limit(10);

  return (items as MealPlanItemRecord[]) ?? [];
}

// Convert pantry items to ingredient string for API
function getPantryIngredients(pantryItems: PantryItem[]): string {
  // Get top 5 pantry items by name
  const ingredients = pantryItems
    .slice(0, 5)
    .map((item) => item.name.toLowerCase())
    .join(",");
  return ingredients;
}

// Get main ingredient tag from recipe title
function getRecipeTag(title: string): string {
  const commonIngredients = [
    "Chicken",
    "Beef",
    "Salmon",
    "Shrimp",
    "Pasta",
    "Rice",
    "Avocado",
    "Spinach",
    "Tomato",
    "Egg",
    "Mushroom",
    "Broccoli",
    "Potato",
    "Carrot",
    "Lemon",
    "Garlic",
    "Onion",
    "Cheese",
    "Turkey",
    "Tuna",
    "Quinoa",
    "Kale",
    "Bean",
    "Tofu",
    "Pork",
    "Lamb",
  ];

  for (const ingredient of commonIngredients) {
    if (title.toLowerCase().includes(ingredient.toLowerCase())) {
      return ingredient;
    }
  }

  // Return first word as tag if no common ingredient found
  return title.split(" ")[0];
}

// Convert API recipe to SuggestedRecipe
function mapRecipeToSuggested(
  recipe: Recipe,
  source: "pantry" | "recent" | "random"
): SuggestedRecipe {
  const calories =
    recipe.nutrition?.nutrients?.find((n) => n.name === "Calories")?.amount ??
    0;

  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    readyInMinutes: recipe.readyInMinutes ?? 30,
    calories: Math.round(calories),
    tag: getRecipeTag(recipe.title),
    source,
  };
}

// Convert recent meal to SuggestedRecipe
function mapRecentMealToSuggested(meal: MealPlanItemRecord): SuggestedRecipe {
  return {
    id: meal.spoonacular_recipe_id,
    title: meal.recipe_name,
    image: meal.recipe_image_url ?? "",
    readyInMinutes: meal.ready_in_minutes ?? 30,
    calories: meal.calories_per_serving ?? 0,
    tag: getRecipeTag(meal.recipe_name),
    source: "recent",
  };
}

export function useSuggestedRecipes() {
  const { session } = useAuthContext();
  const userId = session?.user?.id;
  const { data: pantryItems = [] } = usePantryQuery();

  return useQuery({
    queryKey: ["suggested-recipes", userId, pantryItems.length],
    queryFn: async (): Promise<SuggestedRecipe[]> => {
      const suggestions: SuggestedRecipe[] = [];
      const seenIds = new Set<number>();

      try {
        // 1. Priority: Pantry-based recipes
        if (pantryItems.length > 0) {
          const pantryIngredients = getPantryIngredients(pantryItems);
          const pantryRecipes = await searchRecipesComplex({
            includeIngredients: pantryIngredients,
            number: 3,
            addRecipeNutrition: true,
            sort: "random",
          });

          for (const recipe of pantryRecipes.results) {
            if (!seenIds.has(recipe.id)) {
              seenIds.add(recipe.id);
              suggestions.push(mapRecipeToSuggested(recipe, "pantry"));
            }
          }
        }

        // 2. Recent meals (if user is logged in)
        if (userId && suggestions.length < 6) {
          const recentMeals = await getRecentMeals(userId);
          // Get unique recipes from recent meals
          const uniqueRecentMeals = recentMeals.filter((meal) => {
            if (seenIds.has(meal.spoonacular_recipe_id)) return false;
            seenIds.add(meal.spoonacular_recipe_id);
            return true;
          });

          for (const meal of uniqueRecentMeals.slice(0, 3)) {
            suggestions.push(mapRecentMealToSuggested(meal));
          }
        }

        // 3. Random popular recipes to fill remaining slots
        if (suggestions.length < 6) {
          const remaining = 6 - suggestions.length;
          const randomRecipes = await searchRecipesComplex({
            number: remaining + 2, // Get extra in case of duplicates
            addRecipeNutrition: true,
            sort: "random",
            maxReadyTime: 45,
          });

          for (const recipe of randomRecipes.results) {
            if (!seenIds.has(recipe.id) && suggestions.length < 6) {
              seenIds.add(recipe.id);
              suggestions.push(mapRecipeToSuggested(recipe, "random"));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching suggested recipes:", error);
        // Return empty array on error, component will handle fallback
      }

      return suggestions.slice(0, 6);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}
