const SPOONACULAR_API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY || "";
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com/recipes";
const SPOONACULAR_FOOD_BASE_URL = "https://api.spoonacular.com/food";

// Test constant - API pahalı olduğu için test için 1 olarak ayarlandı
const TEST_NUMBER_OF_RESULTS = 1;

export interface Recipe {
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
  extendedIngredients?: {
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
      apiKey: SPOONACULAR_API_KEY,
    });

    // Filtreleri ekle
    if (filters?.diet) {
      params.append("diet", filters.diet);
    }
    if (filters?.cuisine) {
      params.append("cuisine", filters.cuisine);
    }
    if (filters?.includeIngredients) {
      params.append("includeIngredients", filters.includeIngredients);
    }
    if (filters?.excludeIngredients) {
      params.append("excludeIngredients", filters.excludeIngredients);
    }

    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/complexSearch?${params.toString()}`
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
 * @returns Tarif dizisi ve toplam sonuç sayısı
 */
export async function searchRecipes(
  query: string,
  offset: number = 0,
  number: number = TEST_NUMBER_OF_RESULTS
): Promise<{ recipes: Recipe[]; totalResults: number }> {
  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/complexSearch?query=${encodeURIComponent(
        query
      )}&offset=${offset}&number=${number}&addRecipeInformation=true&addRecipeNutrition=true&apiKey=${SPOONACULAR_API_KEY}`
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
 * Tarif detaylarını çeker
 * @param id - Tarif ID'si
 * @returns Tarif detayları
 */
export async function getRecipeDetails(id: number): Promise<Recipe> {
  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/${id}/information?apiKey=${SPOONACULAR_API_KEY}`
    );

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
      apiKey: SPOONACULAR_API_KEY,
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
      `${SPOONACULAR_FOOD_BASE_URL}/ingredients/search?${params.toString()}`
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
