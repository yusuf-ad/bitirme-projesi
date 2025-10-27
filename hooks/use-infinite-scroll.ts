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

// Spoonacular zaman zaman aynı tarifi dönebiliyor, bu yüzden listeyi benzersiz tutalım
const dedupeRecipes = (items: Recipe[]): Recipe[] => {
  const seenIds = new Set<number>();
  return items.filter((recipe) => {
    if (seenIds.has(recipe.id)) {
      return false;
    }
    seenIds.add(recipe.id);
    return true;
  });
};

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
  const requestIdRef = useRef(0);

  // İlk yükleme
  const loadInitialRecipes = useCallback(async () => {
    if (initialLoadDone.current) return;

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      let newRecipes: Recipe[] = [];
      let nextHasMore = true;
      let nextTotalResults = 0;
      let nextOffset = initialPageSize;

      if (query.trim()) {
        // Arama modunda
        const result = await searchRecipes(query, 0, initialPageSize);
        newRecipes = result.recipes;
        nextTotalResults = result.totalResults;
        nextHasMore = initialPageSize < result.totalResults;
      } else {
        // Random modunda - malzemeleri ve mutfak filtrelerini uygula
        const ingredientNames = ingredients.map((ing) => ing.name).join(",");
        const cuisineNames = cuisines.join(",");

        newRecipes = await getRandomRecipes(initialPageSize, {
          cuisine: cuisineNames || "",
          includeIngredients: ingredientNames || "",
          excludeIngredients: "pork",
        });
        nextTotalResults = newRecipes.length;
        nextHasMore = true; // Random modunda her zaman daha fazla var
      }

      const uniqueRecipes = dedupeRecipes(newRecipes);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setRecipes(uniqueRecipes);
      offsetRef.current = nextOffset;
      totalResultsRef.current = nextTotalResults;
      setHasMore(nextHasMore);
      initialLoadDone.current = true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      if (requestId === requestIdRef.current) {
        setError(error);
      }
      console.error("Error loading initial recipes:", error);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
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

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      if (query.trim()) {
        // Arama modunda
        const result = await searchRecipes(query, offsetRef.current, pageSize);
        const newRecipes = result.recipes;

        if (requestId !== requestIdRef.current) {
          return;
        }

        if (newRecipes.length > 0) {
          setRecipes((prev) => dedupeRecipes([...prev, ...newRecipes]));
          offsetRef.current += pageSize;
          totalResultsRef.current = result.totalResults;
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
        const uniqueNewRecipes = dedupeRecipes(newRecipes);

        if (requestId !== requestIdRef.current) {
          return;
        }

        if (uniqueNewRecipes.length > 0) {
          setRecipes((prev) => dedupeRecipes([...prev, ...uniqueNewRecipes]));
          offsetRef.current += pageSize;
          setHasMore(true); // Random modunda her zaman daha fazla var
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      if (requestId === requestIdRef.current) {
        setError(error);
      }
      console.error("Error loading more recipes:", error);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
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
