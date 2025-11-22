import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { Recipe } from "@/lib/spoonacular";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
import { Alert } from "react-native";
import {
  addFavoriteRecipe,
  fetchFavoriteRecipes,
  removeFavoriteRecipe,
} from "../services/favorite-recipes";

interface MutationContext {
  previousFavorites: Recipe[];
  optimisticAction: "add" | "remove";
}

export function useFavoriteRecipes() {
  const { session } = useAuthContext();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const queryKey = ["favorite-recipes", userId ?? "guest"];
  
  // Track the intended action to prevent race conditions
  const pendingActionRef = useRef<Map<number, "add" | "remove">>(new Map());

  const favoritesQuery = useQuery({
    queryKey,
    queryFn: () => fetchFavoriteRecipes(userId as string),
    enabled: Boolean(userId),
  });

  const mutation = useMutation<
    unknown,
    Error,
    Recipe,
    MutationContext | undefined
  >({
    mutationFn: async (recipe: Recipe) => {
      if (!userId) {
        throw new Error("User is not authenticated.");
      }

      // Get the intended action from the pending map
      const intendedAction = pendingActionRef.current.get(recipe.id);
      
      console.log("🔄 Toggle favorite mutation started for recipe:", recipe.id);
      console.log("🎯 Intended action:", intendedAction);

      if (!intendedAction) {
        throw new Error("No pending action found");
      }

      if (intendedAction === "remove") {
        await removeFavoriteRecipe(userId, recipe.id);
        console.log("🗑️ Removed from favorites");
        return { action: "removed", recipeId: recipe.id } as const;
      }

      await addFavoriteRecipe(userId, recipe);
      console.log("💾 Added to favorites");
      return { action: "added", recipeId: recipe.id } as const;
    },
    onMutate: async (recipe) => {
      console.log("⚡ onMutate: Starting optimistic update");

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousFavorites =
        queryClient.getQueryData<Recipe[]>(queryKey) ?? [];

      // Determine action based on current state
      const isCurrentlyFavorite = previousFavorites.some(
        (fav) => fav.id === recipe.id
      );
      const optimisticAction: "add" | "remove" = isCurrentlyFavorite
        ? "remove"
        : "add";

      // Store the intended action
      pendingActionRef.current.set(recipe.id, optimisticAction);

      console.log("🔮 Optimistic action:", {
        action: optimisticAction,
        recipeId: recipe.id,
        currentCount: previousFavorites.length,
      });

      // Optimistically update the cache
      const optimisticFavorites =
        optimisticAction === "remove"
          ? previousFavorites.filter((fav) => fav.id !== recipe.id)
          : [recipe, ...previousFavorites];

      queryClient.setQueryData(queryKey, optimisticFavorites);

      console.log("✨ Cache updated optimistically:", {
        newCount: optimisticFavorites.length,
      });

      return { previousFavorites, optimisticAction };
    },
    onError: (error, recipe, context) => {
      console.error("❌ Mutation error:", error);
      
      // Clean up pending action
      pendingActionRef.current.delete(recipe.id);

      // Rollback to previous state
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKey, context.previousFavorites);
        console.log("↩️ Rolled back to previous state");
      }

      Alert.alert(
        "Could not update favorites",
        `Error: ${error.message}\n\nPlease check your connection and try again.`
      );
    },
    onSuccess: (data, recipe) => {
      console.log("✅ Mutation succeeded:", data);
      
      // Clean up pending action
      pendingActionRef.current.delete(recipe.id);
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      console.log("🔄 Refetching favorites from server");
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const toggleFavorite = useCallback(
    (recipe: Recipe) => {
      if (!userId) {
        Alert.alert("Session not found", "Please log in to add to favorites.");
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

