import { searchRecipesByIngredients } from "@/lib/spoonacular";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export interface UsePantryRecipesQueryOptions {
  ingredients?: string[];
  enabled?: boolean;
  number?: number;
  ignorePantry?: boolean;
  type?: string;
}

export function usePantryRecipesQuery({
  ingredients = [],
  enabled = true,
  number = 50,
  ignorePantry = true,
  type,
}: UsePantryRecipesQueryOptions = {}) {
  // Sort ingredients to ensure stable query key regardless of order
  const ingredientsStr = useMemo(
    () => ingredients.sort().join(","),
    [ingredients]
  );

  const queryKey = useMemo(
    () => ["pantry-recipes", ingredientsStr, number, ignorePantry, type],
    [ingredientsStr, number, ignorePantry, type]
  );

  const { data, error, isLoading, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!ingredientsStr) return { results: [], totalResults: 0 };
      console.log(
        "Fetching pantry recipes for:",
        ingredientsStr,
        "Type:",
        type
      );
      return searchRecipesByIngredients(
        ingredientsStr,
        number,
        ignorePantry,
        type
      );
    },
    enabled: enabled && ingredients.length > 0,
    // Cache configuration
    gcTime: 1000 * 60 * 30, // Keep cache for 30 minutes
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  return {
    recipes: data?.results || [],
    totalCount: data?.totalResults || 0,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
