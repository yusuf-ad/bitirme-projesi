import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useEffect, useMemo } from "react";
import { MealDetailContent } from "./meal-detail-content";
import { useMealDetail } from "../hooks/use-meal-detail";

interface MealDetailScreenProps {
  mealId: number | null;
}

export function MealDetailScreen({ mealId }: MealDetailScreenProps) {
  const canLoadMeal = typeof mealId === "number" && !Number.isNaN(mealId);

  const {
    data,
    isPending,
    isRefetching,
    refetch,
    error,
  } = useMealDetail(canLoadMeal ? mealId : null);

  const headerTitle = useMemo(() => data?.title ?? "Meal details", [data?.title]);

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
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerTitle,
          headerTintColor: Colors.text.primary,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: Colors.background.surface,
          },
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

