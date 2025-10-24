const SPOONACULAR_API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY || "";
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com/recipes";

export interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
}

interface SpoonacularResponse {
  results: {
    id: number;
    title: string;
    image: string;
    readyInMinutes?: number;
    servings?: number;
    sourceUrl?: string;
  }[];
  offset: number;
  number: number;
  totalResults: number;
}

/**
 * Rastgele tarifler çeker
 * @param number - Çekilecek tarif sayısı (default: 10)
 * @returns Tarif dizisi
 */
export async function getRandomRecipes(number: number = 10): Promise<Recipe[]> {
  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/random?number=${number}&apiKey=${SPOONACULAR_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.recipes || [];
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
      )}&offset=${offset}&number=${number}&apiKey=${SPOONACULAR_API_KEY}`
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
