import {
  Ingredient,
  Recipe,
  getRandomRecipes,
  searchRecipes,
} from "@/lib/spoonacular";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseInfiniteScrollOptions {
  initialPageSize?: number;
  pageSize?: number;
  query?: string; // Arama sorgusu (olmadığında random recipes kullanılır)
  ingredients?: Ingredient[]; // Seçili malzemeler
  cuisines?: string[]; // Seçili mutfaklar
}

export interface UseInfiniteScrollResult {
  recipes: Recipe[];
  loading: boolean;
  hasMore: boolean;
  error: Error | null;
  onEndReached: () => void;
  refresh: () => Promise<void>;
}

/**
 * Infinite scrolling için hook
 * @param options - Konfigürasyon seçenekleri
 * @returns Tarifler, loading durumu, ve kontrol fonksiyonları
 */
export function useInfiniteScroll(
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollResult {
  const {
    initialPageSize = 10,
    pageSize = 10,
    query = "",
    ingredients = [],
    cuisines = [],
  } = options;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const offsetRef = useRef(0);
  const totalResultsRef = useRef(0);
  const initialLoadDone = useRef(false);

  // İlk yükleme
  const loadInitialRecipes = useCallback(async () => {
    if (initialLoadDone.current) return;

    setLoading(true);
    setError(null);

    try {
      let newRecipes: Recipe[] = [];

      if (query.trim()) {
        // Arama modunda
        const result = await searchRecipes(query, 0, initialPageSize);
        newRecipes = result.recipes;
        totalResultsRef.current = result.totalResults;
        offsetRef.current = initialPageSize;
        setHasMore(offsetRef.current < result.totalResults);
      } else {
        // Random modunda - malzemeleri ve mutfak filtrelerini uygula
        const ingredientNames = ingredients.map((ing) => ing.name).join(",");
        const cuisineNames = cuisines.join(",");

        newRecipes = await getRandomRecipes(initialPageSize, {
          cuisine: cuisineNames || "",
          includeIngredients: ingredientNames || "",
          excludeIngredients: "pork",
        });
        console.log("Fetched random recipes:", newRecipes, {
          ingredientNames,
          cuisineNames,
        });

        totalResultsRef.current = newRecipes.length;
        offsetRef.current = initialPageSize;
        setHasMore(true); // Random modunda her zaman daha fazla var
      }

      setRecipes(newRecipes);
      initialLoadDone.current = true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error("Error loading initial recipes:", error);
    } finally {
      setLoading(false);
    }
  }, [query, initialPageSize, ingredients, cuisines]);

  // Query, ingredients veya cuisines değiştiğinde resetle ve yeniden yükle
  useEffect(() => {
    // State'i resetle
    setRecipes([]);
    offsetRef.current = 0;
    initialLoadDone.current = false;
    setHasMore(true);
    setError(null);

    // Yeni arama ile yükle
    loadInitialRecipes();
  }, [query, ingredients, cuisines, loadInitialRecipes]);

  // Scroll sonu callback
  const onEndReached = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      if (query.trim()) {
        // Arama modunda
        const result = await searchRecipes(query, offsetRef.current, pageSize);
        const newRecipes = result.recipes;

        if (newRecipes.length > 0) {
          setRecipes((prev) => [...prev, ...newRecipes]);
          offsetRef.current += pageSize;
          setHasMore(offsetRef.current < result.totalResults);
        } else {
          setHasMore(false);
        }
      } else {
        // Random modunda daha çek - malzemeleri ve mutfak filtrelerini uygula
        const ingredientNames = ingredients.map((ing) => ing.name).join(",");
        const cuisineNames = cuisines.join(",");

        const newRecipes = await getRandomRecipes(pageSize, {
          cuisine: cuisineNames || "",
          includeIngredients: ingredientNames || "",
          excludeIngredients: "pork",
        });
        if (newRecipes.length > 0) {
          setRecipes((prev) => [...prev, ...newRecipes]);
          offsetRef.current += pageSize;
          setHasMore(true); // Random modunda her zaman daha fazla var
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error("Error loading more recipes:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, query, pageSize, ingredients, cuisines]);

  // Yenile
  const refresh = useCallback(async () => {
    setRecipes([]);
    offsetRef.current = 0;
    initialLoadDone.current = false;
    setHasMore(true);
    setError(null);
    await loadInitialRecipes();
  }, [loadInitialRecipes]);

  return {
    recipes,
    loading,
    hasMore,
    error,
    onEndReached,
    refresh,
  };
}
