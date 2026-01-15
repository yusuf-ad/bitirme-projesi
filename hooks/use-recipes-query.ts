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
  excludeIngredients?: string[]; // Allergens and dislikes to exclude
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
 * Check if a recipe is a beverage/drink (to filter them out)
 */
const isBeverageRecipe = (recipe: Recipe): boolean => {
  const beverageTypes = ["beverage", "drink", "cocktail", "smoothie", "shake"];
  const dishTypes = recipe.dishTypes || [];
  const title = recipe.title?.toLowerCase() || "";

  // Check if any dishType is a beverage
  const hasBeverageDishType = dishTypes.some((type) =>
    beverageTypes.some((bevType) => type.toLowerCase().includes(bevType))
  );

  // Also check title for common drink keywords
  const hasBeverageInTitle =
    beverageTypes.some((bevType) => title.includes(bevType)) ||
    title.includes("martini") ||
    title.includes("mojito") ||
    title.includes("margarita") ||
    title.includes("gin") ||
    title.includes("vodka") ||
    title.includes("whiskey") ||
    title.includes("rum") ||
    title.includes("tequila");

  return hasBeverageDishType || hasBeverageInTitle;
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
  pageSize = 20,
  minReadyTime = null,
  maxReadyTime = null,
  minCalories = null,
  maxCalories = null,
  excludeIngredients = [],
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
      excludeIngredients.sort().join(","),
    ],
    [
      query,
      ingredients,
      cuisines,
      quickFilters,
      minReadyTime,
      maxReadyTime,
      minCalories,
      maxCalories,
      excludeIngredients,
    ]
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
      // When ingredients are selected, prioritize recipes using more of them
      const hasIngredients = ingredientNames.length > 0;
      let sort = hasIngredients ? "max-used-ingredients" : undefined;
      if (shouldSortByTime) sort = "time";
      if (isHealthy) sort = "healthiness";

      const sortDirection = shouldSortByTime
        ? "desc"
        : isHealthy
          ? "desc"
          : undefined;

      // Easy filter: max 30 minutes
      const effectiveMaxReadyTime = isEasy
        ? Math.min(maxReadyTime ?? 30, 30)
        : maxReadyTime;

      // Add 1 minute buffer to maxReadyTime for API call
      // Spoonacular API uses < (less than) instead of <= (less than or equal)
      // So we add 1 to include boundary values (e.g., 45 min recipes when max is 45)
      const apiMaxReadyTime = effectiveMaxReadyTime
        ? effectiveMaxReadyTime + 1
        : undefined;

      // Veg filter: vegetarian diet
      const diet = isVeg ? "vegetarian" : undefined;

      // Build excludeIngredients list - combine user allergies with default exclusions
      const allExclusions = ["pork", ...excludeIngredients].filter(Boolean);
      const excludeIngredientsParam = allExclusions.length > 0 ? allExclusions.join(",") : undefined;

      if (query.trim()) {
        // Search mode with filters
        const result = await searchRecipes(query, pageParam, pageSize, {
          cuisine: cuisineNames || undefined,
          includeIngredients: ingredientNames || undefined,
          excludeIngredients: excludeIngredientsParam,
          maxReadyTime: apiMaxReadyTime,
          minCalories: minCalories ?? undefined,
          maxCalories: maxCalories ?? undefined,
          sort,
          sortDirection,
          diet,
        });
        // Client-side time filtering for precise range matching
        let filtered = result.recipes.filter((recipe) => {
          if (recipe.readyInMinutes == null) return true; // Keep recipes without time info
          if (minReadyTime && recipe.readyInMinutes < minReadyTime) return false;
          if (effectiveMaxReadyTime && recipe.readyInMinutes > effectiveMaxReadyTime)
            return false;
          return true;
        });

        // Note: API already filters by includeIngredients parameter
        // No additional client-side ingredient filtering needed

        // Batch filter: servings >= 6
        if (isBatch) {
          filtered = filtered.filter((recipe) => (recipe.servings ?? 0) >= 6);
        }

        // Filter out beverages/drinks
        filtered = filtered.filter((recipe) => !isBeverageRecipe(recipe));

        return {
          recipes: filtered,
          totalResults: result.totalResults,
          offset: pageParam,
          rawCount: result.recipes.length, // Track pre-filter count for pagination
        };
      } else {
        // Random mode with filters
        const recipes = await getRandomRecipes(pageSize, pageParam, {
          cuisine: cuisineNames || undefined,
          includeIngredients: ingredientNames || undefined,
          excludeIngredients: excludeIngredientsParam,
          maxReadyTime: apiMaxReadyTime,
          minCalories: minCalories ?? undefined,
          maxCalories: maxCalories ?? undefined,
          sort,
          sortDirection,
          diet,
        });

        // Client-side time filtering for precise range matching
        let filtered = recipes.filter((recipe) => {
          if (recipe.readyInMinutes == null) return true; // Keep recipes without time info
          if (minReadyTime && recipe.readyInMinutes < minReadyTime) return false;
          if (effectiveMaxReadyTime && recipe.readyInMinutes > effectiveMaxReadyTime)
            return false;
          return true;
        });

        // Note: API already filters by includeIngredients parameter
        // No additional client-side ingredient filtering needed

        // Batch filter: servings >= 6
        if (isBatch) {
          filtered = filtered.filter((recipe) => (recipe.servings ?? 0) >= 6);
        }

        // Filter out beverages/drinks
        filtered = filtered.filter((recipe) => !isBeverageRecipe(recipe));

        return {
          recipes: filtered,
          totalResults: filtered.length, // Random mode doesn't return total
          offset: pageParam,
          rawCount: recipes.length, // Track pre-filter count for pagination
        };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      // Use rawCount (pre-filter count) to decide if there's more data from API
      const rawCount = (lastPage as any).rawCount ?? lastPage.recipes.length;

      if (query.trim()) {
        // Search mode: check if we have more results
        const totalFetched = allPages.reduce(
          (sum, page) => sum + ((page as any).rawCount ?? page.recipes.length),
          0
        );
        return totalFetched < lastPage.totalResults ? totalFetched : undefined;
      } else {
        // Random mode: continue if API returned full page (regardless of filtering)
        return rawCount >= pageSize ? lastPage.offset + pageSize : undefined;
      }
    },
    initialPageParam: 0,
    enabled,
    // Cache configuration for expensive API
    gcTime: 1000 * 60 * 30, // Keep cache for 30 minutes (was cacheTime)
    // When ingredients are selected, always fetch fresh data; otherwise cache for 5 minutes
    staleTime: ingredients.length > 0 ? 0 : 1000 * 60 * 5,
    // Ensure query refetches when filters change
    refetchOnMount: "always",
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
