import { Recipe } from "@/lib/spoonacular";
import { supabase } from "@/lib/supabase";

// AI recipe ID range (900000+)
export const AI_RECIPE_ID_MIN = 900000;

/**
 * Check if a recipe ID is an AI-generated recipe
 */
export function isAiRecipeId(recipeId: number): boolean {
  return recipeId >= AI_RECIPE_ID_MIN;
}

/**
 * Save an AI-generated recipe to Supabase
 */
export async function saveAiRecipe(
  userId: string,
  recipe: Recipe & { isAiGenerated?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract nutrition values
    const nutrients = recipe.nutrition?.nutrients || [];
    const calories = nutrients.find(
      (n) => n.name.toLowerCase() === "calories"
    )?.amount;
    const protein = nutrients.find(
      (n) => n.name.toLowerCase() === "protein"
    )?.amount;
    const carbs = nutrients.find(
      (n) => n.name.toLowerCase() === "carbohydrates"
    )?.amount;
    const fat = nutrients.find((n) => n.name.toLowerCase() === "fat")?.amount;

    const { error } = await supabase.from("ai_generated_recipes").upsert(
      {
        user_id: userId,
        recipe_id: recipe.id,
        title: recipe.title,
        summary: recipe.summary || null,
        image_url: recipe.image || null,
        ready_in_minutes: recipe.readyInMinutes || null,
        servings: recipe.servings || null,
        cuisines: recipe.cuisines || [],
        dish_types: recipe.dishTypes || [],
        diets: recipe.diets || [],
        ingredients: recipe.extendedIngredients || [],
        instructions: recipe.analyzedInstructions || [],
        nutrition: recipe.nutrition || {},
        calories_per_serving:
          typeof calories === "number" ? Math.round(calories) : null,
        protein_per_serving:
          typeof protein === "number" ? Math.round(protein) : null,
        carbs_per_serving: typeof carbs === "number" ? Math.round(carbs) : null,
        fat_per_serving: typeof fat === "number" ? Math.round(fat) : null,
      },
      {
        onConflict: "user_id,recipe_id",
      }
    );

    if (error) {
      console.error("Error saving AI recipe:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving AI recipe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get an AI-generated recipe by recipe_id from Supabase
 * Note: RLS requires user to be authenticated
 */
export async function getAiRecipeById(
  recipeId: number
): Promise<Recipe | null> {
  try {
    // First try without user_id filter (in case recipe was shared or RLS allows it)
    const { data, error } = await supabase
      .from("ai_generated_recipes")
      .select("*")
      .eq("recipe_id", recipeId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching AI recipe:", error);
      return null;
    }

    if (!data) {
      console.log("AI recipe not found for recipe_id:", recipeId);
      return null;
    }

    // Convert Supabase data back to Recipe format
    const recipe: Recipe = {
      id: data.recipe_id,
      title: data.title,
      image: data.image_url || "",
      summary: data.summary || undefined,
      cuisines: data.cuisines || [],
      dishTypes: data.dish_types || [],
      diets: data.diets || [],
      readyInMinutes: data.ready_in_minutes || undefined,
      servings: data.servings || undefined,
      nutrition: data.nutrition || undefined,
      extendedIngredients: data.ingredients || [],
      analyzedInstructions: data.instructions || [],
    };

    return recipe;
  } catch (error) {
    console.error("Error fetching AI recipe:", error);
    return null;
  }
}

/**
 * Delete an AI-generated recipe from Supabase
 */
export async function deleteAiRecipe(
  userId: string,
  recipeId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("ai_generated_recipes")
      .delete()
      .eq("user_id", userId)
      .eq("recipe_id", recipeId);

    if (error) {
      console.error("Error deleting AI recipe:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting AI recipe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all AI-generated recipes for a user
 */
export async function getUserAiRecipes(userId: string): Promise<Recipe[]> {
  try {
    const { data, error } = await supabase
      .from("ai_generated_recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user AI recipes:", error);
      return [];
    }

    return (data || []).map((item) => ({
      id: item.recipe_id,
      title: item.title,
      image: item.image_url || "",
      summary: item.summary || undefined,
      cuisines: item.cuisines || [],
      dishTypes: item.dish_types || [],
      diets: item.diets || [],
      readyInMinutes: item.ready_in_minutes || undefined,
      servings: item.servings || undefined,
      nutrition: item.nutrition || undefined,
      extendedIngredients: item.ingredients || [],
      analyzedInstructions: item.instructions || [],
    }));
  } catch (error) {
    console.error("Error fetching user AI recipes:", error);
    return [];
  }
}
