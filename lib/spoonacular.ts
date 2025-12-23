// RapidAPI credentials
export const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
export const RAPIDAPI_HOST =
  "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com";

// RapidAPI Spoonacular endpoints
export const SPOONACULAR_BASE_URL = `https://${RAPIDAPI_HOST}/recipes`;
export const SPOONACULAR_FOOD_BASE_URL = `https://${RAPIDAPI_HOST}/food`;

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds initial retry delay

// Track last request time to enforce rate limiting
let lastRequestTime = 0;

/**
 * Enforces rate limiting by waiting if necessary
 */
async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

/**
 * Implements exponential backoff for retries
 */
async function exponentialBackoff(attempt: number): Promise<void> {
  const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
  console.log(`Waiting ${delay}ms before retry (attempt ${attempt + 1})`);
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Makes a rate-limited API request with retry logic
 */
export async function makeRateLimitedRequest(
  url: string,
  options: RequestInit,
  attempt: number = 0
): Promise<Response> {
  await enforceRateLimit();

  try {
    const response = await fetch(url, options);

    logRateLimitHeaders(response);

    // Handle rate limiting (429) and server errors (5xx)
    if (
      response.status === 429 ||
      (response.status >= 500 && response.status < 600)
    ) {
      if (attempt < MAX_RETRIES) {
        await exponentialBackoff(attempt);
        return makeRateLimitedRequest(url, options, attempt + 1);
      }
    }

    return response;
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      await exponentialBackoff(attempt);
      return makeRateLimitedRequest(url, options, attempt + 1);
    }
    throw error;
  }
}

const TEST_NUMBER_OF_RESULTS = 10;

// Common pantry staples for pre-filling
const COMMON_PANTRY_STAPLES = [
  "5 pieces Apples",
  "1 bunch Bananas",
  "1 kg Carrots",
  "1 kg Onions",
  "1 head Garlic",
  "2 kg Potatoes",
  "6 pieces Tomatoes",
  "500g Chicken Breast",
  "500g Ground Beef",
  "500g Salmon",
  "1 liter Milk",
  "12 pieces Eggs",
  "250g Butter",
  "200g Cheddar Cheese",
  "500g Yogurt",
  "1 kg Rice",
  "500g Pasta",
  "1 loaf Bread",
  "1 kg Flour",
  "500g Oats",
  "1 pack Salt",
  "1 jar Black Pepper",
  "1 liter Olive Oil",
  "1 liter Vegetable Oil",
  "2 cans Black Beans",
  "2 cans Tuna",
  "1 bottle Ketchup",
  "1 jar Mayonnaise",
  "1 liter Soy Sauce",
  "1 kg Sugar",
];

/**
 * Logs rate limit headers from Spoonacular API response
 * @param response - The fetch response object
 */
export function logRateLimitHeaders(response: Response): void {
  const rateLimitHeaders = {
    "X-Ratelimit-Classifications-Limit": response.headers.get(
      "X-Ratelimit-Classifications-Limit"
    ),
    "X-Ratelimit-Classifications-Remaining": response.headers.get(
      "X-Ratelimit-Classifications-Remaining"
    ),
    "X-Ratelimit-Requests-Limit": response.headers.get(
      "X-Ratelimit-Requests-Limit"
    ),
    "X-Ratelimit-Requests-Remaining": response.headers.get(
      "X-Ratelimit-Requests-Remaining"
    ),
    "X-Ratelimit-Tinyrequests-Limit": response.headers.get(
      "X-Ratelimit-Tinyrequests-Limit"
    ),
    "X-Ratelimit-Tinyrequests-Remaining": response.headers.get(
      "X-Ratelimit-Tinyrequests-Remaining"
    ),
  };
  console.log("Spoonacular Rate Limit Headers:", rateLimitHeaders);
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  summary?: string;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  readyInMinutes?: number;
  servings?: number;
  minServings?: number;
  maxServings?: number;
  sourceUrl?: string;
  instructions?: string;
  analyzedInstructions?: {
    name: string;
    steps: {
      number: number;
      step: string;
    }[];
  }[];
  nutrition?: {
    nutrients?: {
      name: string;
      amount: number;
      unit: string;
    }[];
  };
  extendedIngredients?: {
    id?: number;
    original: string;
    name: string;
    amount: number;
    unit: string;
    measures?: {
      metric: {
        amount: number;
        unitShort: string;
        unitLong: string;
      };
      us: {
        amount: number;
        unitShort: string;
        unitLong: string;
      };
    };
  }[];
  // Used when fillIngredients is true
  usedIngredients?: {
    id: number;
    name: string;
    image: string;
  }[];
  missedIngredients?: {
    id: number;
    name: string;
    image: string;
  }[];
}

export interface ExtendedIngredient {
  id: number;
  amount: number;
  unit: string;
  unitLong: string;
  unitShort: string;
  aisle: string;
  name: string;
  original: string;
  originalName: string;
  meta: string[];
  image: string;
}

export interface RecipeByIngredient {
  id: number;
  title: string;
  image: string;
  imageType: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: ExtendedIngredient[];
  usedIngredients: ExtendedIngredient[];
  unusedIngredients: ExtendedIngredient[];
  likes: number;
}

export interface Ingredient {
  id: number;
  name: string;
  image?: string;
}

export interface IngredientSearchResponse {
  results: Ingredient[];
  offset: number;
  number: number;
  totalResults: number;
}

interface SpoonacularResponse {
  results: {
    id: number;
    title: string;
    image: string;
    readyInMinutes?: number;
    servings?: number;
    sourceUrl?: string;
    nutrition?: {
      nutrients?: {
        name: string;
        amount: number;
        unit: string;
      }[];
    };
  }[];
  offset: number;
  number: number;
  totalResults: number;
}

export interface RandomRecipesFilters {
  diet?: string;
  cuisine?: string;
  type?: string; // Meal type: breakfast, lunch, dinner, etc.
  includeIngredients?: string;
  excludeIngredients?: string;
  maxReadyTime?: number;
  sort?: string;
  sortDirection?: "asc" | "desc";
  minCalories?: number;
  maxCalories?: number;
}

export interface IngredientSearchFilters {
  addChildren?: boolean;
  minProteinPercent?: number;
  maxProteinPercent?: number;
  minFatPercent?: number;
  maxFatPercent?: number;
  minCarbsPercent?: number;
  maxCarbsPercent?: number;
  metaInformation?: boolean;
  intolerances?: string;
  sort?: string;
  sortDirection?: "asc" | "desc";
  language?: "en" | "de";
}

/**
 * Rastgele tarifler çeker (Complex Search endpoint kullanarak)
 * @param number - Çekilecek tarif sayısı (default: 10)
 * @param filters - Filtreleme parametreleri (diet, cuisine, includeIngredients, excludeIngredients)
 * @returns Tarif dizisi
 */
export async function getRandomRecipes(
  number: number = TEST_NUMBER_OF_RESULTS,
  filters?: RandomRecipesFilters
): Promise<Recipe[]> {
  try {
    const params = new URLSearchParams({
      number: number.toString(),
      sort: filters?.sort ?? "random",
      addRecipeInformation: "true",
      addRecipeNutrition: "true",
      fillIngredients: "true",
    });

    // Filtreleri ekle
    if (filters?.diet) {
      params.append("diet", filters.diet);
    }
    if (filters?.cuisine) {
      params.append("cuisine", filters.cuisine);
    }
    if (filters?.type) {
      params.append("type", filters.type);
    }
    if (filters?.includeIngredients) {
      params.append("includeIngredients", filters.includeIngredients);
    }
    if (filters?.excludeIngredients) {
      params.append("excludeIngredients", filters.excludeIngredients);
    }
    if (filters?.maxReadyTime != null) {
      params.append("maxReadyTime", filters.maxReadyTime.toString());
    }
    if (filters?.sortDirection) {
      params.append("sortDirection", filters.sortDirection);
    }
    if (filters?.minCalories != null) {
      params.append("minCalories", filters.minCalories.toString());
    }
    if (filters?.maxCalories != null) {
      params.append("maxCalories", filters.maxCalories.toString());
    }

    const response = await makeRateLimitedRequest(
      `${SPOONACULAR_BASE_URL}/complexSearch?${params.toString()}`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: SpoonacularResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching random recipes:", error);
    throw error;
  }
}

/**
 * Arama parametreleriyle tarifler çeker (pagination desteklı)
 * @param query - Arama sorgusu
 * @param offset - Başlangıç pozisyonu (default: 0)
 * @param number - Çekilecek tarif sayısı (default: 10)
 * @param filters - Filtreleme parametreleri (diet, cuisine, includeIngredients, excludeIngredients)
 * @returns Tarif dizisi ve toplam sonuç sayısı
 */
export async function searchRecipes(
  query: string,
  offset: number = 0,
  number: number = TEST_NUMBER_OF_RESULTS,
  filters?: RandomRecipesFilters
): Promise<{ recipes: Recipe[]; totalResults: number }> {
  try {
    const params = new URLSearchParams({
      query: query,
      offset: offset.toString(),
      number: number.toString(),
      addRecipeInformation: "true",
      addRecipeNutrition: "true",
      fillIngredients: "true",
    });

    // Add filters
    if (filters?.diet) {
      params.append("diet", filters.diet);
    }
    if (filters?.cuisine) {
      params.append("cuisine", filters.cuisine);
    }
    if (filters?.type) {
      params.append("type", filters.type);
    }
    if (filters?.includeIngredients) {
      params.append("includeIngredients", filters.includeIngredients);
    }
    if (filters?.excludeIngredients) {
      params.append("excludeIngredients", filters.excludeIngredients);
    }
    if (filters?.maxReadyTime != null) {
      params.append("maxReadyTime", filters.maxReadyTime.toString());
    }
    if (filters?.sort) {
      params.append("sort", filters.sort);
    }
    if (filters?.sortDirection) {
      params.append("sortDirection", filters.sortDirection);
    }
    if (filters?.minCalories != null) {
      params.append("minCalories", filters.minCalories.toString());
    }
    if (filters?.maxCalories != null) {
      params.append("maxCalories", filters.maxCalories.toString());
    }

    const response = await makeRateLimitedRequest(
      `${SPOONACULAR_BASE_URL}/complexSearch?${params.toString()}`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: SpoonacularResponse = await response.json();
    return {
      recipes: data.results || [],
      totalResults: data.totalResults || 0,
    };
  } catch (error) {
    console.error("Error searching recipes:", error);
    throw error;
  }
}

/**
 * Search recipes by ingredients using complexSearch with min-missing-ingredients sort
 * @param ingredients - Comma separated list of ingredients
 * @param number - Number of recipes to return
 * @param ignorePantry - Whether to ignore typical pantry items
 * @param type - Meal type (breakfast, lunch, dinner, etc.)
 */
export async function searchRecipesByIngredients(
  ingredients: string,
  number: number = TEST_NUMBER_OF_RESULTS,
  ignorePantry: boolean = true,
  type?: string
): Promise<{ results: Recipe[]; totalResults: number }> {
  try {
    const params = new URLSearchParams({
      includeIngredients: ingredients,
      sort: "min-missing-ingredients",
      number: number.toString(),
      addRecipeInformation: "true",
      addRecipeNutrition: "true",
      fillIngredients: "true",
      ignorePantry: ignorePantry.toString(),
    });

    if (type) {
      params.append("type", type);
    }

    const response = await makeRateLimitedRequest(
      `${SPOONACULAR_BASE_URL}/complexSearch?${params.toString()}`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: SpoonacularResponse = await response.json();
    return {
      results: data.results || [],
      totalResults: data.totalResults || 0,
    };
  } catch (error) {
    console.error("Error searching recipes by ingredients:", error);
    throw error;
  }
}

/**
 * Tarif detaylarını çeker
 * @param id - Tarif ID'si
 * @returns Tarif detayları
 */
export async function getRecipeDetails(id: number): Promise<Recipe> {
  try {
    const url = `${SPOONACULAR_BASE_URL}/${id}/information?includeNutrition=true`;
    const response = await makeRateLimitedRequest(url, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    throw error;
  }
}

/**
 * Bulk fetch recipe information
 * @param ids - Array of recipe IDs
 */
export async function getRecipesInformationBulk(
  ids: number[]
): Promise<Recipe[]> {
  if (ids.length === 0) return [];

  try {
    const params = new URLSearchParams({
      ids: ids.join(","),
      includeNutrition: "true",
    });

    const response = await makeRateLimitedRequest(
      `${SPOONACULAR_BASE_URL}/informationBulk?${params.toString()}`,
      {
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
    console.error("Error fetching bulk recipe details:", error);
    throw error;
  }
}

/**
 * Malzemeleri arar (Ingredient Search endpoint)
 * @param query - Aranacak malzeme adı (kısmi veya tam)
 * @param offset - Başlangıç pozisyonu (default: 0)
 * @param number - Çekilecek malzeme sayısı (default: 10, max: 100)
 * @param filters - Ek filtreleme parametreleri
 * @returns Malzeme listesi ve toplam sonuç sayısı
 */
export async function searchIngredients(
  query: string,
  offset: number = 0,
  number: number = TEST_NUMBER_OF_RESULTS,
  filters?: IngredientSearchFilters
): Promise<{ ingredients: Ingredient[]; totalResults: number }> {
  try {
    const params = new URLSearchParams({
      query: query,
      offset: offset.toString(),
      number: number.toString(),
    });

    // Add optional filters
    if (filters?.addChildren !== undefined) {
      params.append("addChildren", filters.addChildren.toString());
    }
    if (filters?.minProteinPercent !== undefined) {
      params.append("minProteinPercent", filters.minProteinPercent.toString());
    }
    if (filters?.maxProteinPercent !== undefined) {
      params.append("maxProteinPercent", filters.maxProteinPercent.toString());
    }
    if (filters?.minFatPercent !== undefined) {
      params.append("minFatPercent", filters.minFatPercent.toString());
    }
    if (filters?.maxFatPercent !== undefined) {
      params.append("maxFatPercent", filters.maxFatPercent.toString());
    }
    if (filters?.minCarbsPercent !== undefined) {
      params.append("minCarbsPercent", filters.minCarbsPercent.toString());
    }
    if (filters?.maxCarbsPercent !== undefined) {
      params.append("maxCarbsPercent", filters.maxCarbsPercent.toString());
    }
    if (filters?.metaInformation !== undefined) {
      params.append("metaInformation", filters.metaInformation.toString());
    }
    if (filters?.intolerances) {
      params.append("intolerances", filters.intolerances);
    }
    if (filters?.sort) {
      params.append("sort", filters.sort);
    }
    if (filters?.sortDirection) {
      params.append("sortDirection", filters.sortDirection);
    }
    if (filters?.language) {
      params.append("language", filters.language);
    }

    const response = await makeRateLimitedRequest(
      `${SPOONACULAR_FOOD_BASE_URL}/ingredients/search?${params.toString()}`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: IngredientSearchResponse = await response.json();
    return {
      ingredients: data.results || [],
      totalResults: data.totalResults || 0,
    };
  } catch (error) {
    console.error("Error searching ingredients:", error);
    throw error;
  }
}

export interface ParsedIngredient {
  id: number;
  original: string;
  originalName: string;
  name: string;
  image: string;
  amount: number;
  unit: string;
  possibleUnits: string[];
  estimatedCost: {
    value: number;
    unit: string;
  };
  consistency: string;
  aisle: string;
}

export interface MealPlanNutrients {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

export interface MealPlanOptions {
  diet?: string;
  targetCalories?: number;
  timeFrame?: "day" | "week";
}

interface MealPlanResponse {
  meals: Recipe[];
  nutrients: MealPlanNutrients;
}

export async function generateMealPlan(
  options: MealPlanOptions = {}
): Promise<MealPlanResponse> {
  try {
    const params = new URLSearchParams({
      timeFrame: options.timeFrame ?? "day",
    });

    if (options.diet) {
      params.append("diet", options.diet);
    }
    if (options.targetCalories) {
      params.append("targetCalories", options.targetCalories.toString());
    }

    const response = await makeRateLimitedRequest(
      `${SPOONACULAR_BASE_URL}/mealplans/generate?${params.toString()}`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Meal plan API Error: ${response.status} ${response.statusText}`
      );
    }

    return (await response.json()) as MealPlanResponse;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw error;
  }
}

/**
 * Batch parse ingredients to get IDs and images
 * @param ingredientList - List of ingredients as strings (e.g. "1 cup sugar")
 * @returns List of parsed ingredients
 */
export async function parseIngredients(
  ingredientList: string[]
): Promise<ParsedIngredient[]> {
  try {
    const formData = new URLSearchParams();
    formData.append("ingredientList", ingredientList.join("\n"));
    formData.append("includeNutrition", "false");

    const response = await makeRateLimitedRequest(
      `${SPOONACULAR_BASE_URL}/parseIngredients`,
      {
        method: "POST",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error parsing ingredients:", error);
    throw error;
  }
}

/**
 * Gets common pantry staples using parseIngredients
 * Returns a list of parsed ingredients for the predefined common staples
 */
export async function getCommonPantryIngredients(): Promise<
  ParsedIngredient[]
> {
  return parseIngredients(COMMON_PANTRY_STAPLES);
}

/**
 * Find recipes by ingredients (uses findByIngredients endpoint)
 * @param ingredients - List of ingredients
 * @param number - Number of results (default: 10)
 * @param ranking - 1 to maximize used ingredients, 2 to minimize missing ingredients (default: 1)
 * @param ignorePantry - Whether to ignore typical pantry items (default: true)
 * @returns List of recipes with used/missed ingredients
 */
export async function findRecipesByIngredients(
  ingredients: string[],
  number: number = 10,
  ranking: number = 1,
  ignorePantry: boolean = true
): Promise<RecipeByIngredient[]> {
  try {
    const params = new URLSearchParams({
      ingredients: ingredients.join(","),
      number: number.toString(),
      ranking: ranking.toString(),
      ignorePantry: ignorePantry.toString(),
    });

    const response = await makeRateLimitedRequest(
      `${SPOONACULAR_BASE_URL}/findByIngredients?${params.toString()}`,
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
    console.error("Error finding recipes by ingredients:", error);
    throw error;
  }
}

/**
 * Get information about an ingredient
 * @param id - The ingredient ID
 * @returns Ingredient information including name
 */
export async function getIngredientInformation(
  id: number
): Promise<{ name: string }> {
  try {
    const response = await makeRateLimitedRequest(
      `${SPOONACULAR_FOOD_BASE_URL}/ingredients/${id}/information`,
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
    console.error(`Error fetching ingredient info for ID ${id}:`, error);
    throw error;
  }
}
