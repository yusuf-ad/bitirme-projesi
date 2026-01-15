import { DIET_OPTIONS } from "@/features/onboarding/sections/taste/diet-options";
import { POPULAR_INGREDIENTS } from "@/lib/constants";

const INGREDIENT_IMAGE_BASE_URL = "https://spoonacular.com/cdn/ingredients_100x100";
const SPOONACULAR_BASE_URL = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food";
const RAPIDAPI_HOST = "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";

/**
 * Resolves allergy IDs to ingredient names for API filtering
 * Returns an array of ingredient names that should be excluded from recipes
 */
export function resolveAllergyNames(allergyIds: string[]): string[] {
  return allergyIds
    .map(id => {
      // Try to parse as numeric ID first
      const numericId = parseInt(id, 10);

      if (!isNaN(numericId)) {
        // Check popular ingredients
        const popularIngredient = POPULAR_INGREDIENTS.find(
          ing => ing.spoonacularId === numericId
        );

        if (popularIngredient) {
          return popularIngredient.name;
        }

        // Return null for unknown IDs - they won't be included
        return null;
      }

      // Handle name-prefixed IDs (e.g., "name-apple")
      if (id.startsWith("name-")) {
        const name = id
          .replace("name-", "")
          .split("-")
          .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join(" ");
        return name;
      }

      // For plain string IDs, use as-is
      return id;
    })
    .filter(Boolean) as string[];
}

export interface DisplayDietPreference {
  id: string;
  label: string;
  image: any; // ImageSourcePropType
}

export interface DisplayAllergy {
  id: string;
  name: string;
  image?: string;
  imageUrl?: string;
}

/**
 * Resolves diet preference IDs to display data
 */
export function resolveDietPreferences(dietIds: string[]): DisplayDietPreference[] {
  return dietIds
    .map(id => {
      const dietOption = DIET_OPTIONS.find(d => d.id === id);
      if (!dietOption) return null;

      return {
        id: dietOption.id,
        label: dietOption.label,
        image: dietOption.image,
      };
    })
    .filter(Boolean) as DisplayDietPreference[];
}

/**
 * Gets the full image URL for an allergy item
 */
export function getAllergyImageUrl(imagePath?: string): string | undefined {
  if (!imagePath) return undefined;
  return `${INGREDIENT_IMAGE_BASE_URL}/${imagePath}`;
}

/**
 * Fetches ingredient information from Spoonacular API
 * https://spoonacular.com/food-api/docs#Get-Ingredient-Information
 */
export async function fetchIngredientInformation(
  ingredientId: number
): Promise<{ name: string; image: string } | null> {
  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/ingredients/${ingredientId}/information?amount=1`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      console.warn(`API Error for ingredient ${ingredientId}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      name: data.name || `Ingredient ${ingredientId}`,
      image: data.image || "",
    };
  } catch (error) {
    console.error(`Error fetching ingredient ${ingredientId}:`, error);
    return null;
  }
}

/**
 * Resolves allergy IDs to display data with images
 * Tries to find in popular ingredients first, then fetches from API if needed
 */
export async function resolveAllergiesWithImages(
  allergyIds: string[]
): Promise<DisplayAllergy[]> {
  const resolvedAllergies: DisplayAllergy[] = [];

  for (const id of allergyIds) {
    // Try to parse as numeric ID first
    const numericId = parseInt(id, 10);

    if (!isNaN(numericId)) {
      // Check popular ingredients first (cached data)
      const popularIngredient = POPULAR_INGREDIENTS.find(
        ing => ing.spoonacularId === numericId
      );

      if (popularIngredient) {
        resolvedAllergies.push({
          id,
          name: popularIngredient.name,
          image: popularIngredient.image,
          imageUrl: getAllergyImageUrl(popularIngredient.image),
        });
        continue;
      }

      // Fetch from Spoonacular API
      const apiData = await fetchIngredientInformation(numericId);
      if (apiData) {
        resolvedAllergies.push({
          id,
          name: apiData.name,
          image: apiData.image,
          imageUrl: getAllergyImageUrl(apiData.image),
        });
      } else {
        // Fallback
        resolvedAllergies.push({
          id,
          name: `Ingredient ${numericId}`,
        });
      }
    } else if (id.startsWith("name-")) {
      // Handle name-prefixed IDs (e.g., "name-apple")
      const name = id
        .replace("name-", "")
        .split("-")
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");

      // Try to find matching popular ingredient
      const popularIngredient = POPULAR_INGREDIENTS.find(
        ing => ing.name.toLowerCase() === name.toLowerCase()
      );

      resolvedAllergies.push({
        id,
        name,
        image: popularIngredient?.image,
        imageUrl: getAllergyImageUrl(popularIngredient?.image),
      });
    } else {
      // Fallback for unknown IDs
      resolvedAllergies.push({
        id,
        name: id,
      });
    }
  }

  return resolvedAllergies;
}

/**
 * Batch resolves allergies without API calls (uses local data only)
 * Faster but less accurate for unknown IDs
 */
export function resolveAllergiesFast(allergyIds: string[]): DisplayAllergy[] {
  return allergyIds
    .map(id => {
      // Try to parse as numeric ID first
      const numericId = parseInt(id, 10);

      if (!isNaN(numericId)) {
        // Check popular ingredients
        const popularIngredient = POPULAR_INGREDIENTS.find(
          ing => ing.spoonacularId === numericId
        );

        if (popularIngredient) {
          return {
            id,
            name: popularIngredient.name,
            image: popularIngredient.image,
            imageUrl: getAllergyImageUrl(popularIngredient.image),
          };
        }

        // Fallback for numeric IDs not in popular ingredients
        return {
          id,
          name: `Ingredient ${numericId}`,
        };
      }

      // Handle name-prefixed IDs
      if (id.startsWith("name-")) {
        const name = id
          .replace("name-", "")
          .split("-")
          .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join(" ");

        const popularIngredient = POPULAR_INGREDIENTS.find(
          ing => ing.name.toLowerCase() === name.toLowerCase()
        );

        return {
          id,
          name,
          image: popularIngredient?.image,
          imageUrl: getAllergyImageUrl(popularIngredient?.image),
        };
      }

      // Fallback for unknown IDs
      return {
        id,
        name: id,
      };
    })
    .filter(Boolean) as DisplayAllergy[];
}