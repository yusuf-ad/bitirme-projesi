import { Colors, getThemeColors } from "@/constants/theme";
import { useFavoriteRecipes } from "@/features/home/hooks/use-favorite-recipes";
import { useHaptics } from "@/hooks/useHaptics";
import { useTheme } from "@/providers/theme-provider";
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
}

export function MealDetailScreen({ mealId, mealSlot }: MealDetailScreenProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const { selection, impact } = useHaptics();
  const canLoadMeal = typeof mealId === "number" && !Number.isNaN(mealId);

  const { data, isPending, isRefetching, refetch, error } = useMealDetail(
    canLoadMeal ? mealId : null
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
    selection();
    await refetch();
  }, [refetch, selection]);

  const handleBack = useCallback(() => {
    impact(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router, impact]);

  const handleToggleFavorite = useCallback(async () => {
    if (!data) return;
    impact(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(data);
  }, [data, toggleFavorite, impact]);

  const handlePlanMeal = useCallback(async () => {
    if (!data) {
      return;
    }
    selection();
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
  }, [data, router, macroSnapshot, mealSlot, selection]);

  const renderState = () => {
    if (!canLoadMeal) {
      return (
        <View style={[styles.centered, { backgroundColor: themeColors.background.primary }]}>
          <Text style={[styles.errorText, { color: themeColors.text.primary }]}>
            We were unable to find that meal. Please try again from the recipes
            list.
          </Text>
        </View>
      );
    }

    if (isPending && !data) {
      return (
        <View style={[styles.centered, { backgroundColor: themeColors.background.primary }]}>
          <ActivityIndicator size="large" color={isDark ? themeColors.accent.lilac : Colors.lilac[800]} />
        </View>
      );
    }

    if (error || !data) {
      return (
        <View style={[styles.centered, { backgroundColor: themeColors.background.primary }]}>
          <Text style={[styles.errorText, { color: themeColors.text.primary }]}>
            Something went wrong while loading this meal.
          </Text>
          <Pressable
            onPress={handleRefresh}
            style={[styles.retryButton, { backgroundColor: isDark ? themeColors.accent.lilac : Colors.lilac[800] }]}
            hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          >
            <Text style={[styles.retryButtonText, { color: isDark ? "#000" : Colors.background.surface }]}>Retry</Text>
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background.surface }]} edges={[]}>
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
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    fontFamily: "Inter",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "600",
  },
});
