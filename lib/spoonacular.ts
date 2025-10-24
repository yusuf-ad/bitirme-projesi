const SPOONACULAR_API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY || "";
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com/recipes";

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

/**
 * Rastgele tarifler çeker (Complex Search endpoint kullanarak)
 * @param number - Çekilecek tarif sayısı (default: 10)
 * @param filters - Filtreleme parametreleri (diet, cuisine, includeIngredients, excludeIngredients)
 * @returns Tarif dizisi
 */
export async function getRandomRecipes(
  number: number = 10,
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
  number: number = 10
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
