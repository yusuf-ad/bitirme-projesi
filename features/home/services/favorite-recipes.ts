import { supabase } from "@/lib/supabase";
import { Recipe } from "@/lib/spoonacular";

interface FavoriteRecipeRow {
  id: string;
  user_id: string;
  recipe_id: number;
  recipe_title: string;
  recipe_image?: string | null;
  ready_in_minutes?: number | null;
  calories?: number | null;
  recipe_payload: Recipe;
  created_at: string;
}

function extractCalories(recipe: Recipe): number | null {
  const caloriesNutrient = recipe.nutrition?.nutrients?.find(
    (nutrient) => nutrient.name.toLowerCase() === "calories"
  );

  if (!caloriesNutrient || typeof caloriesNutrient.amount !== "number") {
    return null;
  }

  return Math.round(caloriesNutrient.amount);
}

export async function fetchFavoriteRecipes(userId: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("favorite_recipes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FavoriteRecipeRow[];
  return rows.map((row) => row.recipe_payload);
}

export async function addFavoriteRecipe(
  userId: string,
  recipe: Recipe
): Promise<void> {
  const { error } = await supabase.from("favorite_recipes").insert({
    user_id: userId,
    recipe_id: recipe.id,
    recipe_title: recipe.title,
    recipe_image: recipe.image,
    ready_in_minutes: recipe.readyInMinutes ?? null,
    calories: extractCalories(recipe),
    recipe_payload: recipe,
  });

  if (error) {
    throw error;
  }
}

export async function removeFavoriteRecipe(
  userId: string,
  recipeId: number
): Promise<void> {
  const { error } = await supabase
    .from("favorite_recipes")
    .delete()
    .eq("user_id", userId)
    .eq("recipe_id", recipeId);

  if (error) {
    throw error;
  }
}

