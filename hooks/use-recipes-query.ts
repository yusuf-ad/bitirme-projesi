import {
    Ingredient,
    Recipe,
    getRandomRecipes,
    searchRecipes,
} from "@/lib/spoonacular";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export interface UseRecipesQueryOptions {
  enabled?: boolean;
  query?: string;
  ingredients?: Ingredient[];
  cuisines?: string[];
  quickFilters?: string[]; // Healthy, Easy, Batch, Veg
  pageSize?: number;
  minReadyTime?: number | null;
  maxReadyTime?: number | null;
  minCalories?: number | null;
  maxCalories?: number | null;
}

// Deduplicate recipes by ID
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
 * Hook for infinite query with TanStack Query
 * Handles caching automatically
 */
export function useRecipesQuery({
  enabled = true,
  query = "",
  ingredients = [],
  cuisines = [],
  quickFilters = [],
  pageSize = 10,
  minReadyTime = null,
  maxReadyTime = null,
  minCalories = null,
  maxCalories = null,
}: UseRecipesQueryOptions = {}) {
  // Create stable query key based on filters
  const queryKey = useMemo(
    () => [
      "recipes",
      query,
      ingredients
        .map((i) => i.id)
        .sort()
        .join(","),
      cuisines.sort().join(","),
      quickFilters.sort().join(","),
      minReadyTime ?? "",
      maxReadyTime ?? "",
      minCalories ?? "",
      maxCalories ?? "",
    ],
    [query, ingredients, cuisines, quickFilters, minReadyTime, maxReadyTime, minCalories, maxCalories]
  );

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      // Prepare filters that are shared between both modes
      const ingredientNames = ingredients.map((ing) => ing.name).join(",");
      const cuisineNames = cuisines.join(",");
      const shouldSortByTime = Boolean(minReadyTime);
      
      // Quick filters mapping
      const isHealthy = quickFilters.includes("Healthy");
      const isEasy = quickFilters.includes("Easy");
      const isVeg = quickFilters.includes("Veg");
      const isBatch = quickFilters.includes("Batch");
      
      // Determine sort based on filters
      let sort = shouldSortByTime ? "time" : undefined;
      if (isHealthy) sort = "healthiness";
      
      const sortDirection = shouldSortByTime ? "desc" : isHealthy ? "desc" : undefined;
      
      // Easy filter: max 30 minutes
      const effectiveMaxReadyTime = isEasy ? Math.min(maxReadyTime ?? 30, 30) : maxReadyTime;
      
      // Veg filter: vegetarian diet
      const diet = isVeg ? "vegetarian" : undefined;

      if (query.trim()) {
        // Search mode with filters
        const result = await searchRecipes(query, pageParam, pageSize, {
          cuisine: cuisineNames || undefined,
          includeIngredients: ingredientNames || undefined,
          excludeIngredients: "pork",
          maxReadyTime: effectiveMaxReadyTime ?? undefined,
          minCalories: minCalories ?? undefined,
          maxCalories: maxCalories ?? undefined,
          sort,
          sortDirection,
          diet,
        });
        let filtered = minReadyTime
          ? result.recipes.filter((recipe) => {
              if (recipe.readyInMinutes == null) return false;
              return recipe.readyInMinutes >= minReadyTime;
            })
          : result.recipes;
        
        // Batch filter: servings >= 6
        if (isBatch) {
          filtered = filtered.filter((recipe) => (recipe.servings ?? 0) >= 6);
        }
        
        return {
          recipes: filtered,
          totalResults: result.totalResults,
          offset: pageParam,
        };
      } else {
        // Random mode with filters
        const recipes = await getRandomRecipes(pageSize, {
          cuisine: cuisineNames || undefined,
          includeIngredients: ingredientNames || undefined,
          excludeIngredients: "pork",
          maxReadyTime: effectiveMaxReadyTime ?? undefined,
          minCalories: minCalories ?? undefined,
          maxCalories: maxCalories ?? undefined,
          sort,
          sortDirection,
          diet,
        });

        let filtered = minReadyTime
          ? recipes.filter((recipe) => {
              if (recipe.readyInMinutes == null) return false;
              return recipe.readyInMinutes >= minReadyTime;
            })
          : recipes;
        
        // Batch filter: servings >= 6
        if (isBatch) {
          filtered = filtered.filter((recipe) => (recipe.servings ?? 0) >= 6);
        }

        return {
          recipes: filtered,
          totalResults: filtered.length, // Random mode doesn't return total
          offset: pageParam,
        };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (query.trim()) {
        // Search mode: check if we have more results
        const totalFetched = allPages.reduce(
          (sum, page) => sum + page.recipes.length,
          0
        );
        return totalFetched < lastPage.totalResults ? totalFetched : undefined;
      } else {
        // Random mode: stop if we get fewer results than requested (API limit reached)
        return lastPage.recipes.length === pageSize
          ? lastPage.offset + pageSize
          : undefined;
      }
    },
    initialPageParam: 0,
    enabled,
    // Cache configuration for expensive API
    gcTime: 1000 * 60 * 30, // Keep cache for 30 minutes (was cacheTime)
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Flatten and deduplicate all pages
  const recipes = useMemo(() => {
    if (!data?.pages) return [];
    const allRecipes = data.pages.flatMap((page) => page.recipes);
    return dedupeRecipes(allRecipes);
  }, [data]);

  const isLoading = status === "pending";
  const hasMore = hasNextPage ?? false;

  return {
    recipes,
    isLoading,
    isFetching: isFetching && !isFetchingNextPage,
    isFetchingNextPage,
    hasMore,
    error,
    fetchNextPage,
    refetch,
  };
}
