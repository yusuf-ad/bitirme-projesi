// RapidAPI credentials
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com";

// RapidAPI Spoonacular endpoints
const SPOONACULAR_BASE_URL = `https://${RAPIDAPI_HOST}/recipes`;
const SPOONACULAR_FOOD_BASE_URL = `https://${RAPIDAPI_HOST}/food`;

// Test constant - API pahalı olduğu için test için 1 olarak ayarlandı
const TEST_NUMBER_OF_RESULTS = 1;

/**
 * Logs rate limit headers from Spoonacular API response
 * @param response - The fetch response object
 */
function logRateLimitHeaders(response: Response): void {
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
  diets?: string[];
  readyInMinutes?: number;
  servings?: number;
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
  }[];
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
      sort: "random",
      addRecipeInformation: "true",
      addRecipeNutrition: "true",
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

    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/complexSearch?${params.toString()}`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    logRateLimitHeaders(response);

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

    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/complexSearch?${params.toString()}`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    logRateLimitHeaders(response);

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
 * Tarif detaylarını çeker
 * @param id - Tarif ID'si
 * @returns Tarif detayları
 */
export async function getRecipeDetails(id: number): Promise<Recipe> {
  try {
    const url = `${SPOONACULAR_BASE_URL}/${id}/information?includeNutrition=true`;
    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    logRateLimitHeaders(response);

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

    const response = await fetch(
      `${SPOONACULAR_FOOD_BASE_URL}/ingredients/search?${params.toString()}`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    logRateLimitHeaders(response);

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

    const response = await fetch(`${SPOONACULAR_BASE_URL}/parseIngredients`, {
      method: "POST",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    logRateLimitHeaders(response);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error parsing ingredients:", error);
    throw error;
  }
}
