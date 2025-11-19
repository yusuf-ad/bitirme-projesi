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
  console.log("🔍 Fetching favorites for user:", userId);

  const { data, error } = await supabase
    .from("favorite_recipes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching favorites:", error);
    throw error;
  }

  console.log("✅ Favorites fetched successfully:", data?.length ?? 0, "items");
  const rows = (data ?? []) as FavoriteRecipeRow[];
  return rows.map((row) => row.recipe_payload);
}

export async function addFavoriteRecipe(
  userId: string,
  recipe: Recipe
): Promise<void> {
  console.log("➕ Adding favorite:", {
    userId,
    recipeId: recipe.id,
    recipeTitle: recipe.title,
  });

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
    console.error("❌ Error adding favorite:", error);
    throw error;
  }

  console.log("✅ Favorite added successfully");
}

export async function removeFavoriteRecipe(
  userId: string,
  recipeId: number
): Promise<void> {
  console.log("➖ Removing favorite:", { userId, recipeId });

  const { error } = await supabase
    .from("favorite_recipes")
    .delete()
    .eq("user_id", userId)
    .eq("recipe_id", recipeId);

  if (error) {
    console.error("❌ Error removing favorite:", error);
    throw error;
  }

  console.log("✅ Favorite removed successfully");
}

