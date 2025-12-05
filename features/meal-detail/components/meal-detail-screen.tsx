import { Colors } from "@/constants/theme";
import { useFavoriteRecipes } from "@/features/home/hooks/use-favorite-recipes";
import { getMacroSummary } from "@/shared/utils/nutrition";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMealDetail } from "../hooks/use-meal-detail";
import { MealDetailContent } from "./meal-detail-content";

interface MealDetailScreenProps {
  mealId: number | null;
  mealSlot?: string;
  isAiGenerated?: boolean;
}

export function MealDetailScreen({
  mealId,
  mealSlot,
  isAiGenerated,
}: MealDetailScreenProps) {
  const router = useRouter();
  const canLoadMeal = typeof mealId === "number" && !Number.isNaN(mealId);

  const { data, isPending, isRefetching, refetch, error } = useMealDetail(
    canLoadMeal ? mealId : null,
    isAiGenerated
  );

  const { favoriteIds, toggleFavorite } = useFavoriteRecipes();
  const isFavorited = useMemo(
    () => (data?.id ? favoriteIds.has(data.id) : false),
    [data?.id, favoriteIds]
  );

  const macroSnapshot = useMemo(
    () => getMacroSummary(data?.nutrition?.nutrients) ?? {},
    [data?.nutrition?.nutrients]
  );

  useEffect(() => {
    if (data?.title) {
      AccessibilityInfo.announceForAccessibility(
        `${data.title} details loaded`
      );
    }
  }, [data?.title]);

  const handleRefresh = useCallback(async () => {
    await Haptics.selectionAsync();
    await refetch();
  }, [refetch]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleToggleFavorite = useCallback(async () => {
    if (!data) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(data);
  }, [data, toggleFavorite]);

  const handlePlanMeal = useCallback(async () => {
    if (!data) {
      return;
    }
    await Haptics.selectionAsync();
    const payload = {
      id: data.id,
      title: data.title,
      image: data.image ?? "",
      readyInMinutes: data.readyInMinutes ?? null,
      macros: macroSnapshot,
    };

    const params: any = {
      recipe: JSON.stringify(payload),
    };

    if (mealSlot) {
      params.mealSlot = mealSlot;
    }

    router.push({
      pathname: "/(plan)/assign-meal",
      params,
    });
  }, [data, router, macroSnapshot, mealSlot]);

  const renderState = () => {
    if (!canLoadMeal) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            We were unable to find that meal. Please try again from the recipes
            list.
          </Text>
        </View>
      );
    }

    if (isPending && !data) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.lilac[800]} />
        </View>
      );
    }

    if (error || !data) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            Something went wrong while loading this meal.
          </Text>
          <Pressable
            onPress={handleRefresh}
            style={styles.retryButton}
            hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <MealDetailContent
        meal={data}
        refreshing={isRefetching}
        onRefresh={handleRefresh}
        isFavorited={isFavorited}
        onToggleFavorite={handleToggleFavorite}
        onBack={handleBack}
        onPlanMeal={handlePlanMeal}
        mealSlot={mealSlot}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      {renderState()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.surface,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
    backgroundColor: Colors.background.surface,
  },
  errorText: {
    fontFamily: "Inter",
    fontSize: 16,
    textAlign: "center",
    color: Colors.text.primary,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.lilac[800],
  },
  retryButtonText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "600",
    color: Colors.background.surface,
  },
});
