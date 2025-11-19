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
  pageSize?: number;
  minReadyTime?: number | null;
  maxReadyTime?: number | null;
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
  pageSize = 10,
  minReadyTime = null,
  maxReadyTime = null,
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
      minReadyTime ?? "",
      maxReadyTime ?? "",
    ],
    [query, ingredients, cuisines, minReadyTime, maxReadyTime]
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
      const sort = shouldSortByTime ? "time" : undefined;
      const sortDirection = shouldSortByTime ? "desc" : undefined;

      if (query.trim()) {
        // Search mode with filters
        const result = await searchRecipes(query, pageParam, pageSize, {
          cuisine: cuisineNames || undefined,
          includeIngredients: ingredientNames || undefined,
          excludeIngredients: "pork",
          maxReadyTime: maxReadyTime ?? undefined,
          sort,
          sortDirection,
        });
        const filtered = minReadyTime
          ? result.recipes.filter((recipe) => {
              if (recipe.readyInMinutes == null) return false;
              return recipe.readyInMinutes >= minReadyTime;
            })
          : result.recipes;
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
          maxReadyTime: maxReadyTime ?? undefined,
          sort,
          sortDirection,
        });

        const filtered = minReadyTime
          ? recipes.filter((recipe) => {
              if (recipe.readyInMinutes == null) return false;
              return recipe.readyInMinutes >= minReadyTime;
            })
          : recipes;

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
