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
 * Fetch full recipe details with ingredients for multiple recipes
 */
export async function fetchRecipesWithIngredients(
  recipeIds: number[]
): Promise<Recipe[]> {
  if (recipeIds.length === 0) return [];

  // Spoonacular bulk endpoint can handle up to 100 IDs at once
  const BATCH_SIZE = 100;
  const allRecipes: Recipe[] = [];

  for (let i = 0; i < recipeIds.length; i += BATCH_SIZE) {
    const batch = recipeIds.slice(i, i + BATCH_SIZE);
    const recipes = await getRecipesInformationBulk(batch);
    allRecipes.push(...recipes);
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
  // 1. Get unique recipe IDs
  const recipeIds = getRecipeIds(mealPlanItems);

  // 2. Fetch full recipe details
  const recipes = await fetchRecipesWithIngredients(recipeIds);

  // 3. Extract all ingredients
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

export const mealPlanIngredientsService = {
  getRecipeIds,
  fetchRecipesWithIngredients,
  extractIngredients,
  getMissingIngredients,
  addMissingIngredientsToShoppingList,
  previewMissingIngredients,
};
