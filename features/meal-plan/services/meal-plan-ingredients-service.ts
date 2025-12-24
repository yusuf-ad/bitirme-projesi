import { pantryService } from "@/features/pantry/services/pantry-service";
import { PantryItem } from "@/features/pantry/types";
import {
  compareIngredientsWithPantry,
  convertToPantryItem,
  convertToRecipeIngredient,
  IngredientComparisonResult,
  mergeIngredients,
  RecipeIngredient,
} from "@/lib/ingredient-matcher";
import {
  ExtendedIngredient,
  getRecipesInformationBulk,
  Recipe,
} from "@/lib/spoonacular";
import { getAiRecipeById, isAiRecipeId } from "@/lib/supabase-ai-recipes";
import { MealPlanItemRecord } from "../types";

/**
 * Result of adding ingredients to shopping list
 */
export interface AddToShoppingListResult {
  /** Number of ingredients added to shopping list */
  addedCount: number;
  /** Ingredients that were added */
  addedItems: PantryItem[];
  /** Ingredients already in pantry with sufficient quantity */
  alreadyInPantryCount: number;
  /** Total unique ingredients needed for the meal plan */
  totalIngredients: number;
}

/**
 * Get all unique recipe IDs from meal plan items
 */
export function getRecipeIds(mealPlanItems: MealPlanItemRecord[]): number[] {
  const ids = new Set<number>();
  for (const item of mealPlanItems) {
    ids.add(item.spoonacular_recipe_id);
  }
  return Array.from(ids);
}

/**
 * Separate meal plan items into AI-generated and Spoonacular recipes
 * Uses the is_ai_generated flag from database for reliable detection
 */
export function separateMealPlanItems(mealPlanItems: MealPlanItemRecord[]): {
  aiRecipeIds: number[];
  spoonacularRecipeIds: number[];
} {
  const aiRecipeIds = new Set<number>();
  const spoonacularRecipeIds = new Set<number>();

  for (const item of mealPlanItems) {
    // Use is_ai_generated flag from database, fall back to ID-based detection
    const isAi =
      item.is_ai_generated ?? isAiRecipeId(item.spoonacular_recipe_id);

    if (isAi) {
      aiRecipeIds.add(item.spoonacular_recipe_id);
    } else {
      spoonacularRecipeIds.add(item.spoonacular_recipe_id);
    }
  }

  return {
    aiRecipeIds: Array.from(aiRecipeIds),
    spoonacularRecipeIds: Array.from(spoonacularRecipeIds),
  };
}

/**
 * Fetch full recipe details with ingredients for multiple recipes
 * Handles both AI-generated recipes and Spoonacular recipes
 */
export async function fetchRecipesWithIngredients(
  mealPlanItems: MealPlanItemRecord[]
): Promise<Recipe[]> {
  if (mealPlanItems.length === 0) return [];

  // Separate AI and Spoonacular recipe IDs using database flag
  const { aiRecipeIds, spoonacularRecipeIds } =
    separateMealPlanItems(mealPlanItems);

  const allRecipes: Recipe[] = [];

  // Fetch AI-generated recipes from Supabase
  if (aiRecipeIds.length > 0) {
    const aiRecipePromises = aiRecipeIds.map((id) => getAiRecipeById(id));
    const aiRecipes = await Promise.all(aiRecipePromises);
    // Filter out null results (recipes that weren't found)
    const validAiRecipes = aiRecipes.filter((r): r is Recipe => r !== null);
    allRecipes.push(...validAiRecipes);
  }

  // Fetch Spoonacular recipes in batches
  if (spoonacularRecipeIds.length > 0) {
    // Spoonacular bulk endpoint can handle up to 100 IDs at once
    const BATCH_SIZE = 100;

    for (let i = 0; i < spoonacularRecipeIds.length; i += BATCH_SIZE) {
      const batch = spoonacularRecipeIds.slice(i, i + BATCH_SIZE);
      const recipes = await getRecipesInformationBulk(batch);
      allRecipes.push(...recipes);
    }
  }

  return allRecipes;
}

/**
 * Extract all ingredients from recipes with recipe name association
 */
export function extractIngredients(recipes: Recipe[]): RecipeIngredient[] {
  const allIngredients: RecipeIngredient[] = [];

  for (const recipe of recipes) {
    if (recipe.extendedIngredients) {
      for (const ing of recipe.extendedIngredients) {
        // Convert to our RecipeIngredient type with recipe name
        const ingredient = convertToRecipeIngredient(
          ing as ExtendedIngredient,
          recipe.title
        );
        allIngredients.push(ingredient);
      }
    }
  }

  return allIngredients;
}

/**
 * Get missing ingredients for a meal plan
 * Compares recipe ingredients with current pantry
 */
export async function getMissingIngredients(
  mealPlanItems: MealPlanItemRecord[]
): Promise<{
  comparison: IngredientComparisonResult;
  mergedMissingIngredients: RecipeIngredient[];
}> {
  // 1. Fetch full recipe details (handles AI vs Spoonacular separation internally)
  const recipes = await fetchRecipesWithIngredients(mealPlanItems);

  // 2. Extract all ingredients
  const allIngredients = extractIngredients(recipes);

  // 4. Merge duplicate ingredients
  const mergedIngredients = mergeIngredients(allIngredients);

  // 5. Get current pantry items
  const pantryItems = await pantryService.getItems("pantry");

  // 6. Compare with pantry
  const comparison = compareIngredientsWithPantry(
    mergedIngredients,
    pantryItems
  );

  // 7. Merge missing and insufficient into final missing list
  const missingList: RecipeIngredient[] = [
    ...comparison.missing,
    ...comparison.insufficient.map((item) => ({
      ...item.ingredient,
      amount: item.neededAmount, // Use only the needed amount
    })),
  ];

  return {
    comparison,
    mergedMissingIngredients: mergeIngredients(missingList),
  };
}

/**
 * Add missing ingredients from meal plan to shopping list
 */
export async function addMissingIngredientsToShoppingList(
  mealPlanItems: MealPlanItemRecord[]
): Promise<AddToShoppingListResult> {
  // Get missing ingredients
  const { comparison, mergedMissingIngredients } = await getMissingIngredients(
    mealPlanItems
  );

  // Convert to pantry items for shopping list
  const itemsToAdd = mergedMissingIngredients.map((ing) =>
    convertToPantryItem(ing)
  );

  // Add to shopping list
  let addedItems: PantryItem[] = [];
  if (itemsToAdd.length > 0) {
    addedItems = await pantryService.addItems(itemsToAdd);
  }

  return {
    addedCount: addedItems.length,
    addedItems,
    alreadyInPantryCount: comparison.available.length,
    totalIngredients:
      comparison.missing.length +
      comparison.insufficient.length +
      comparison.available.length,
  };
}

/**
 * Preview missing ingredients without adding to shopping list
 * Useful for showing user what will be added before confirmation
 */
export async function previewMissingIngredients(
  mealPlanItems: MealPlanItemRecord[]
): Promise<{
  missingIngredients: RecipeIngredient[];
  insufficientIngredients: {
    ingredient: RecipeIngredient;
    pantryAmount: number;
    neededAmount: number;
    pantryUnit: string;
  }[];
  availableIngredients: RecipeIngredient[];
}> {
  const { comparison } = await getMissingIngredients(mealPlanItems);

  return {
    missingIngredients: comparison.missing,
    insufficientIngredients: comparison.insufficient.map((item) => ({
      ingredient: item.ingredient,
      pantryAmount: item.pantryItem.amount,
      neededAmount: item.neededAmount,
      pantryUnit: item.pantryItem.unit,
    })),
    availableIngredients: comparison.available.map((item) => item.ingredient),
  };
}

/**
 * Remove ingredients associated with a meal from the shopping list
 */
export async function removeIngredientsFromShoppingList(
  mealPlanItem: MealPlanItemRecord
): Promise<void> {
  // 1. Fetch ingredients for the meal
  // We need to fetch full details to get the ingredients list
  const recipes = await fetchRecipesWithIngredients([mealPlanItem]);
  const ingredients = extractIngredients(recipes);

  if (ingredients.length === 0) return;

  // 2. Get current shopping list
  const shoppingList = await pantryService.getItems("shopping_list");

  // Use the title from the fetched recipe if available, otherwise fallback to the item record
  const targetRecipeName = recipes[0]?.title || mealPlanItem.recipe_name;

  for (const ingredient of ingredients) {
    // Find matching item in shopping list
    // Check by ID or Name
    const match = shoppingList.find((item) => {
      const idMatch =
        item.spoonacular_id &&
        ingredient.id &&
        item.spoonacular_id === ingredient.id;
      const nameMatch =
        item.name.toLowerCase().trim() === ingredient.name.toLowerCase().trim();

      // Must match ingredient AND contain the recipe name
      return (
        (idMatch || nameMatch) &&
        item.recipe_name &&
        item.recipe_name.includes(targetRecipeName)
      );
    });

    if (match && match.recipe_name) {
      const names = match.recipe_name.split(",").map((s) => s.trim());

      if (names.length === 1 && names[0] === targetRecipeName) {
        // It's only for this recipe -> Delete it
        await pantryService.deleteItem(match.id);
      } else if (names.includes(targetRecipeName)) {
        // It's shared with other recipes -> Remove this recipe name
        const newNames = names.filter((n) => n !== targetRecipeName).join(", ");
        await pantryService.updateItem(match.id, { recipe_name: newNames });
      }
    }
  }
}

export const mealPlanIngredientsService = {
  getRecipeIds,
  separateMealPlanItems,
  fetchRecipesWithIngredients,
  extractIngredients,
  getMissingIngredients,
  addMissingIngredientsToShoppingList,
  previewMissingIngredients,
  removeIngredientsFromShoppingList,
};
