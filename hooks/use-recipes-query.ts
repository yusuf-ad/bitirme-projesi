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
 * Check if a recipe contains ALL of the specified ingredients
 * Uses usedIngredients field from fillIngredients API response
 */
const recipeContainsAllIngredients = (
  recipe: Recipe,
  requiredIngredients: string[]
): boolean => {
  if (requiredIngredients.length === 0) return true;

  // Get all used ingredient names from the recipe (lowercase for comparison)
  // usedIngredients comes from fillIngredients: true in API call
  // Get all ingredient names from both usedIngredients and extendedIngredients
  // to ensure we don't miss any matches
  const allIngredientNames = new Set<string>();

  recipe.usedIngredients?.forEach((ing) =>
    allIngredientNames.add(ing.name.toLowerCase())
  );
  recipe.extendedIngredients?.forEach((ing) =>
    allIngredientNames.add(ing.name.toLowerCase())
  );

  // If we have no ingredient data at all, skip strict filter (fail open)
  if (allIngredientNames.size === 0) {
    return true;
  }

  // Check if ALL required ingredients are present
  return requiredIngredients.every((required) => {
    const requiredLower = required.toLowerCase();
    // Check if any ingredient matches the required ingredient name
    // Using string inclusion for fuzzy matching
    for (const text of allIngredientNames) {
      if (text.includes(requiredLower) || requiredLower.includes(text)) {
        return true;
      }
    }
    return false;
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
    [
      query,
      ingredients,
      cuisines,
      quickFilters,
      minReadyTime,
      maxReadyTime,
      minCalories,
      maxCalories,
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

        // Strict ingredient filter: recipe must contain ALL selected ingredients
        const ingredientNamesList = ingredients.map((ing) => ing.name);
        if (ingredientNamesList.length > 0) {
          filtered = filtered.filter((recipe) =>
            recipeContainsAllIngredients(recipe, ingredientNamesList)
          );
        }

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

        // Strict ingredient filter: recipe must contain ALL selected ingredients
        const ingredientNamesList = ingredients.map((ing) => ing.name);
        if (ingredientNamesList.length > 0) {
          console.log(
            "Applying strict client-side filter for:",
            ingredientNamesList
          );

          filtered = filtered.filter((recipe) => {
            const pass = recipeContainsAllIngredients(
              recipe,
              ingredientNamesList
            );
            if (!pass) {
              console.log(
                `Recipe '${recipe.title}' rejected. UsedIngredients:`,
                recipe.usedIngredients?.map((i) => i.name)
              );
            }
            return pass;
          });
          console.log(
            `Filtered count: ${filtered.length} (from ${recipes.length})`
          );
        }

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
