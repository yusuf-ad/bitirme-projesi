import type { UserOnboardingProfile } from "@/features/onboarding/types/onboarding.types";
import { MEAL_TYPES } from "@/lib/constants";
import { getIngredientInformation } from "@/lib/spoonacular";
import { searchRecipesComplex } from "@/lib/spoonacular-complex-search";
import type { MealType } from "../types";

// Types
interface PantryItem {
  spoonacular_name?: string;
}

interface RecipeNutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface FetchedRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  totalResults: number;
  cuisines: string[];
  mealType: MealType;
  type: string[];
  nutrition: RecipeNutrition;
}

export interface MealTypeResults {
  mealType: MealType;
  results: FetchedRecipe[];
}

// Constants
const SPOONACULAR_TYPE_MAPPING: Record<MealType, string> = {
  breakfast: MEAL_TYPES.BREAKFAST,
  lunch: `${MEAL_TYPES.MAIN_COURSE},${MEAL_TYPES.SALAD},${MEAL_TYPES.SOUP}`,
  dinner: MEAL_TYPES.MAIN_COURSE,
};

// Helper Functions
async function fetchAllergyNames(allergyIds: string[]): Promise<string[]> {
  if (allergyIds.length === 0) return [];

  console.log("Fetching allergy ingredient names...");

  const names: string[] = [];

  for (const allergyId of allergyIds) {
    try {
      const id = parseInt(allergyId);
      if (!isNaN(id)) {
        const info = await getIngredientInformation(id);
        if (info.name) {
          names.push(info.name);
        }
      }
    } catch (e) {
      console.error(`Failed to fetch info for allergy ID ${allergyId}`, e);
    }
  }

  return names;
}

function extractPantryIngredients(pantryData?: PantryItem[]): string {
  return (
    pantryData
      ?.map((item) => item.spoonacular_name)
      .filter((name): name is string => !!name)
      .join(",") || ""
  );
}

function extractNutrient(
  nutrients: { name: string; amount: number }[],
  name: string
): number {
  return nutrients.find((n) => n.name === name)?.amount || 0;
}

function mapRecipeToResult(
  recipe: any,
  mealType: MealType,
  totalResults: number
): FetchedRecipe {
  const nutrients = recipe.nutrition?.nutrients || [];

  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    readyInMinutes: recipe.readyInMinutes,
    totalResults,
    cuisines: recipe.cuisines,
    mealType,
    type: recipe.dishTypes,
    nutrition: {
      calories: extractNutrient(nutrients, "Calories"),
      protein: extractNutrient(nutrients, "Protein"),
      fat: extractNutrient(nutrients, "Fat"),
      carbs: extractNutrient(nutrients, "Carbohydrates"),
    },
  };
}

async function fetchRecipesForMealType(
  mealType: MealType,
  params: {
    cuisine?: string;
    excludeCuisine?: string;
    diet?: string;
    includeIngredients?: string;
    excludeIngredients?: string;
    offset?: number;
  }
): Promise<MealTypeResults> {
  const apiType = SPOONACULAR_TYPE_MAPPING[mealType];

  console.log(`Fetching ${mealType}... (offset: ${params.offset ?? 0})`);

  const response = await searchRecipesComplex({
    ...params,
    type: apiType,
    number: 11,
    addRecipeNutrition: true,
    ignorePantry: false,
    fillIngredients: false,
    sort: "max-used-ingredients",
  });

  return {
    mealType,
    results: response.results.map((recipe) =>
      mapRecipeToResult(recipe, mealType, response.totalResults)
    ),
  };
}

// Main Function
export async function fetchRecipes(
  onboardingData: UserOnboardingProfile | undefined,
  pantryData: PantryItem[] | undefined,
  selectedMealTypes: Record<MealType, boolean>
): Promise<MealTypeResults[] | undefined> {
  if (!onboardingData) {
    console.warn("Onboarding data is not ready yet.");
    return;
  }

  const preferences = onboardingData.tastePreferences;

  console.log("Fetching recipes with user preferences...");

  try {
    const cookingSkillLevel = preferences?.cooking_skill_level || "beginner";

    console.log("User Taste Preferences:", preferences);
    console.log("User Cooking Skill Level:", cookingSkillLevel);

    // Prepare search parameters
    const cuisineParam = preferences?.cuisines?.join(",");
    const excludeCuisineParam = preferences?.cuisine_dislikes?.join(",");
    const dietParam = preferences?.diet_preferences?.join(",");

    const allergyIds = preferences?.allergies_dislikes || [];
    const allergyNames = await fetchAllergyNames(allergyIds);
    const excludeIngredientsParam = allergyNames.join(",");

    const includeIngredientsParam = extractPantryIngredients(pantryData);

    console.log("Exclude Ingredients:", excludeIngredientsParam);
    console.log("Include Ingredients (from pantry):", includeIngredientsParam);

    // Get active meal types
    const activeMealTypes = (
      Object.keys(selectedMealTypes) as MealType[]
    ).filter((type) => selectedMealTypes[type]);

    // Fetch recipes for each meal type
    const results: MealTypeResults[] = [];

    for (const mealType of activeMealTypes) {
      const mealResults = await fetchRecipesForMealType(mealType, {
        cuisine: cuisineParam,
        excludeCuisine: excludeCuisineParam,
        diet: dietParam,
        includeIngredients: includeIngredientsParam,
        excludeIngredients: excludeIngredientsParam,
      });
      results.push(mealResults);
    }

    // Log results
    results.forEach((result) => {
      console.log(
        `\n=== ${result.mealType.toUpperCase()} RESULTS ===`,
        JSON.stringify(result.results, null, 2)
      );
    });

    return results;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
}

// Pagination function - fetch more recipes for a specific meal type
export async function fetchMoreRecipes(
  onboardingData: UserOnboardingProfile | undefined,
  pantryData: PantryItem[] | undefined,
  mealType: MealType,
  offset: number
): Promise<MealTypeResults | undefined> {
  if (!onboardingData) {
    console.warn("Onboarding data is not ready yet.");
    return;
  }

  const preferences = onboardingData.tastePreferences;

  console.log(`Fetching more ${mealType} recipes with offset: ${offset}...`);

  try {
    // Prepare search parameters
    const cuisineParam = preferences?.cuisines?.join(",");
    const excludeCuisineParam = preferences?.cuisine_dislikes?.join(",");
    const dietParam = preferences?.diet_preferences?.join(",");

    const allergyIds = preferences?.allergies_dislikes || [];
    const allergyNames = await fetchAllergyNames(allergyIds);
    const excludeIngredientsParam = allergyNames.join(",");

    const includeIngredientsParam = extractPantryIngredients(pantryData);

    const mealResults = await fetchRecipesForMealType(mealType, {
      cuisine: cuisineParam,
      excludeCuisine: excludeCuisineParam,
      diet: dietParam,
      includeIngredients: includeIngredientsParam,
      excludeIngredients: excludeIngredientsParam,
      offset,
    });

    console.log(
      `\n=== MORE ${mealType.toUpperCase()} RESULTS (offset: ${offset}) ===`,
      JSON.stringify(mealResults.results, null, 2)
    );

    return mealResults;
  } catch (error) {
    console.error(`Error fetching more ${mealType} recipes:`, error);
    throw error;
  }
}
