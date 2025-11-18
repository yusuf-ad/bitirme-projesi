import { useAuthContext } from "@/hooks/use-auth-context";
import { Recipe } from "@/lib/spoonacular";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import {
  addFavoriteRecipe,
  fetchFavoriteRecipes,
  removeFavoriteRecipe,
} from "../services/favorite-recipes";

interface ToggleContext {
  previousFavorites: Recipe[];
}

export function useFavoriteRecipes() {
  const { session } = useAuthContext();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const queryKey = ["favorite-recipes", userId ?? "guest"];

  const favoritesQuery = useQuery({
    queryKey,
    queryFn: () => fetchFavoriteRecipes(userId as string),
    enabled: Boolean(userId),
  });

  const mutation = useMutation<unknown, Error, Recipe, ToggleContext>({
    mutationFn: async (recipe: Recipe) => {
      if (!userId) {
        throw new Error("User is not authenticated.");
      }

      const existingFavorites =
        queryClient.getQueryData<Recipe[]>(queryKey) ?? [];
      const isFavorite = existingFavorites.some(
        (fav) => fav.id === recipe.id
      );

      if (isFavorite) {
        await removeFavoriteRecipe(userId, recipe.id);
        return { action: "removed", recipeId: recipe.id } as const;
      }

      await addFavoriteRecipe(userId, recipe);
      return { action: "added", recipeId: recipe.id } as const;
    },
    onMutate: async (recipe) => {
      await queryClient.cancelQueries({ queryKey });

      const previousFavorites =
        queryClient.getQueryData<Recipe[]>(queryKey) ?? [];
      const exists = previousFavorites.some((fav) => fav.id === recipe.id);

      const optimisticFavorites = exists
        ? previousFavorites.filter((fav) => fav.id !== recipe.id)
        : [recipe, ...previousFavorites];

      queryClient.setQueryData(queryKey, optimisticFavorites);

      return { previousFavorites };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKey, context.previousFavorites);
      }

      Alert.alert(
        "Favoriler güncellenemedi",
        "Lütfen bağlantınızı kontrol edip tekrar deneyin."
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const toggleFavorite = useCallback(
    (recipe: Recipe) => {
      if (!userId) {
        Alert.alert("Oturum bulunamadı", "Favorilere eklemek için giriş yapın.");
        return;
      }

      mutation.mutate(recipe);
    },
    [mutation, userId]
  );

  const favoriteIds = useMemo(
    () => new Set((favoritesQuery.data ?? []).map((recipe) => recipe.id)),
    [favoritesQuery.data]
  );

  return {
    favorites: favoritesQuery.data ?? [],
    favoritesCount: favoritesQuery.data?.length ?? 0,
    favoriteIds,
    isLoadingFavorites: favoritesQuery.isLoading,
    favoritesError: favoritesQuery.error,
    refetchFavorites: favoritesQuery.refetch,
    toggleFavorite,
    isTogglingFavorite: mutation.isPending,
  };
}

