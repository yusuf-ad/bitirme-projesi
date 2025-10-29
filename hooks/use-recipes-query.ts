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
    ],
    [query, ingredients, cuisines]
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
      if (query.trim()) {
        // Search mode
        const result = await searchRecipes(query, pageParam, pageSize);
        return {
          recipes: result.recipes,
          totalResults: result.totalResults,
          offset: pageParam,
        };
      } else {
        // Random mode with filters
        const ingredientNames = ingredients.map((ing) => ing.name).join(",");
        const cuisineNames = cuisines.join(",");

        const recipes = await getRandomRecipes(pageSize, {
          cuisine: cuisineNames || undefined,
          includeIngredients: ingredientNames || undefined,
          excludeIngredients: "pork",
        });

        return {
          recipes,
          totalResults: recipes.length, // Random mode doesn't return total
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
        // Random mode: always has more
        return lastPage.offset + pageSize;
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

  const isLoading = status === "pending" && !isFetching;
  const hasMore = hasNextPage ?? true;

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
