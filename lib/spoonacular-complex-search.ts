import { Cuisine, Diet, MealType, SortOption } from "./constants";
import {
  RAPIDAPI_HOST,
  RAPIDAPI_KEY,
  Recipe,
  SPOONACULAR_BASE_URL,
  makeRateLimitedRequest,
} from "./spoonacular";

export interface ComplexSearchOptions {
  query?: string;
  cuisine?: Cuisine | string;
  excludeCuisine?: Cuisine | string;
  diet?: Diet | string;
  intolerances?: string;
  equipment?: string;
  includeIngredients?: string;
  excludeIngredients?: string;
  type?: MealType | string;
  addRecipeNutrition?: boolean;
  tags?: string;
  recipeBoxId?: number;
  titleMatch?: string;
  maxReadyTime?: number;
  ignorePantry?: boolean;
  sort?: SortOption | string;
  sortDirection?: "asc" | "desc";
  minCarbs?: number;
  maxCarbs?: number;
  minProtein?: number;
  maxProtein?: number;
  minCalories?: number;
  maxCalories?: number;
  minFat?: number;
  maxFat?: number;
  offset?: number;
  number?: number;
  maxAlcohol?: 0;
  fillIngredients?: boolean;
}

export interface ComplexSearchResponse {
  results: Recipe[];
  offset: number;
  number: number;
  totalResults: number;
}

/**
 * Search recipes using the complexSearch endpoint
 * @param options - Search options
 * @returns Search results
 */
export async function searchRecipesComplex(
  options: ComplexSearchOptions
): Promise<ComplexSearchResponse> {
  try {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await makeRateLimitedRequest(
      `${SPOONACULAR_BASE_URL}/complexSearch?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching recipes complex:", error);
    throw error;
  }
}
