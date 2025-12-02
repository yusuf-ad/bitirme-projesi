import ReplaceIcon from "@/assets/icons/replace-icon";
import { Colors } from "@/constants/theme";
import type { MealSelectionModalHandle } from "@/features/meal-plan/components/meal-selection-modal";
import { MealSelectionModal } from "@/features/meal-plan/components/meal-selection-modal";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import {
  createMealItem,
  getMealImageUrl,
  Meal,
  MealPlan,
  MealType,
} from "@/lib/utils";
import CustomButton from "@/shared/components/custom-button";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const normalizeDateParam = (value: unknown): Date => {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (typeof rawValue === "string") {
    const parsed = new Date(rawValue);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
  }

  const fallback = new Date();
  fallback.setHours(0, 0, 0, 0);
  return fallback;
};

const formatDate = (date: Date): string => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${normalized.getFullYear()}-${pad(normalized.getMonth() + 1)}-${pad(
    normalized.getDate()
  )}`;
};

export default function MealPlanPreview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { session } = useAuthContext();
  const queryClient = useQueryClient();

  const mealSelectionRef = useRef<MealSelectionModalHandle>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan>();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMealIndices, setSelectedMealIndices] = useState<
    Partial<Record<MealType, number>>
  >({});
  const [activeMealType, setActiveMealType] = useState<MealType | null>(null);

  const planStartDate = normalizeDateParam(params.startDate);
  const planEndDate = normalizeDateParam(params.endDate ?? params.startDate);

  const allMeals = useMemo(() => {
    return activeMealType ? mealPlan?.[activeMealType]?.results ?? [] : [];
  }, [activeMealType, mealPlan]);

  const currentSelectedIndex = activeMealType
    ? selectedMealIndices[activeMealType] ?? 0
    : 0;

  // Filter out the currently selected meal to show only alternatives
  const alternativeMealsWithIndex = useMemo(() => {
    return allMeals
      .map((meal, index) => ({ meal, index }))
      .filter(({ index }) => index !== currentSelectedIndex);
  }, [allMeals, currentSelectedIndex]);

  const modalMeals = alternativeMealsWithIndex.map(({ meal }) => meal);

  const modalTitle = activeMealType
    ? `Replace ${activeMealType.charAt(0).toUpperCase()}${activeMealType.slice(
        1
      )}`
    : "Select a meal";

  const handleMealSelect = useCallback(
    (index: number) => {
      if (!activeMealType) return;

      // Map the index from the filtered list back to the original index
      const originalIndex = alternativeMealsWithIndex[index]?.index;

      if (originalIndex === undefined) return;

      setSelectedMealIndices((prev) => ({
        ...prev,
        [activeMealType]: originalIndex,
      }));
      mealSelectionRef.current?.dismiss();
    },
    [activeMealType, alternativeMealsWithIndex]
  );

  const handleModalDismiss = useCallback(() => {
    setActiveMealType(null);
  }, []);

  useEffect(() => {
    if (params.mealPlanData) {
      try {
        const data = JSON.parse(params.mealPlanData as string);

        // Check if data is valid and has at least one meal type with results
        if (data && typeof data === "object") {
          const indices: Partial<Record<MealType, number>> = {};

          // Initialize indices for meal types that have results
          if (data.breakfast?.results?.length > 0) {
            indices.breakfast = 0;
          }
          if (data.lunch?.results?.length > 0) {
            indices.lunch = 0;
          }
          if (data.dinner?.results?.length > 0) {
            indices.dinner = 0;
          }

          setMealPlan(data);
          setSelectedMealIndices(indices);
        } else {
          console.error("Invalid meal plan structure:", data);
        }
      } catch (error) {
        console.error("Error parsing meal plan data:", error);
      }
    }
  }, [params.mealPlanData]);

  const handleSaveMealPlan = async () => {
    if (!session?.user?.id) {
      Alert.alert("You need to sign in", "Please sign in to save a meal plan.");
      return;
    }

    if (!mealPlan) {
      Alert.alert(
        "Nothing to save",
        "Generate a meal plan before trying to save it."
      );
      return;
    }

    // Only create meal items for meal types that exist in the plan
    const mealItems: any[] = [];

    if (
      mealPlan.breakfast?.results?.length > 0 &&
      selectedMealIndices.breakfast !== undefined
    ) {
      const breakfastMealItem = createMealItem(
        mealPlan,
        "breakfast",
        selectedMealIndices.breakfast,
        planStartDate
      );
      if (breakfastMealItem) {
        mealItems.push(breakfastMealItem);
      }
    }

    if (
      mealPlan.lunch?.results?.length > 0 &&
      selectedMealIndices.lunch !== undefined
    ) {
      const lunchMealItem = createMealItem(
        mealPlan,
        "lunch",
        selectedMealIndices.lunch,
        planStartDate
      );
      if (lunchMealItem) {
        mealItems.push(lunchMealItem);
      }
    }

    if (
      mealPlan.dinner?.results?.length > 0 &&
      selectedMealIndices.dinner !== undefined
    ) {
      const dinnerMealItem = createMealItem(
        mealPlan,
        "dinner",
        selectedMealIndices.dinner,
        planStartDate
      );
      if (dinnerMealItem) {
        mealItems.push(dinnerMealItem);
      }
    }

    if (mealItems.length === 0) {
      Alert.alert(
        "Missing recipes",
        "Select a recipe for at least one meal before saving."
      );
      return;
    }

    setIsSaving(true);

    try {
      const startDateString = formatDate(planStartDate);
      const endDateString = formatDate(planEndDate);

      const { data: existingPlans, error: existingPlansError } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", session.user.id)
        .lte("start_date", endDateString)
        .gte("end_date", startDateString)
        .limit(1);

      if (existingPlansError) {
        throw existingPlansError;
      }

      if (existingPlans && existingPlans.length > 0) {
        const existingPlanId = existingPlans[0].id;

        // Check if this plan has items
        const { data: existingItems, error: itemsCheckError } = await supabase
          .from("meal_plan_items")
          .select("id")
          .eq("meal_plan_id", existingPlanId)
          .limit(1);

        if (itemsCheckError) {
          throw itemsCheckError;
        }

        if (existingItems && existingItems.length > 0) {
          // Plan has items - show error
          Alert.alert(
            "Meal plan already exists",
            "You already have a meal plan with recipes for this date range."
          );
          return;
        }

        // Plan exists but has no items - delete it and create new one
        console.log("Deleting orphaned meal plan:", existingPlanId);
        const { error: deleteError } = await supabase
          .from("meal_plans")
          .delete()
          .eq("id", existingPlanId);

        if (deleteError) {
          throw deleteError;
        }
      }

      const { data: newPlan, error: planError } = await supabase
        .from("meal_plans")
        .insert([
          {
            user_id: session.user.id,
            name: `my meal plan ${startDateString}`,
            start_date: startDateString,
            end_date: endDateString,
          },
        ])
        .select()
        .single();

      if (planError) {
        throw planError;
      }

      if (!newPlan) {
        throw new Error("Meal plan could not be created.");
      }

      const itemsPayload = mealItems.map((item) => ({
        ...item,
        meal_plan_id: newPlan.id,
      }));

      const { error: itemsError } = await supabase
        .from("meal_plan_items")
        .insert(itemsPayload);

      if (itemsError) {
        // Rollback: Delete the meal plan if items couldn't be inserted
        console.error("Error inserting meal items:", itemsError);
        await supabase.from("meal_plans").delete().eq("id", newPlan.id);
        throw new Error(
          `Failed to save meal items: ${itemsError.message || "Unknown error"}`
        );
      }

      // Invalidate meal plans cache to refresh the home page
      await queryClient.invalidateQueries({
        queryKey: ["meal-plans"],
      });

      Alert.alert("Meal plan saved", "Your meal plan has been saved.", [
        {
          text: "OK",
          onPress: () => router.replace("/(app)"),
        },
      ]);
    } catch (error) {
      console.error("Error saving meal plan:", error);
      const message =
        error instanceof Error ? error.message : "Unable to save meal plan.";
      Alert.alert("Error saving meal plan", message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderMealItem = (meal: Meal, mealType: MealType) => {
    const imageUrl = getMealImageUrl(meal);

    const handleReplace = () => {
      const mealTypeData = mealPlan?.[mealType];

      if (!mealTypeData || mealTypeData.results.length === 0) {
        Alert.alert(
          "No recipes found",
          `There are no ${mealType} recipes to choose from right now.`
        );
        return;
      }

      setActiveMealType(mealType);
      mealSelectionRef.current?.present();
    };

    const carbs = meal.nutrition?.carbs
      ? `${Math.round(meal.nutrition.carbs)}g`
      : undefined;
    const protein = meal.nutrition?.protein
      ? `${Math.round(meal.nutrition.protein)}g`
      : undefined;
    const fat = meal.nutrition?.fat
      ? `${Math.round(meal.nutrition.fat)}g`
      : undefined;

    return (
      <View key={meal.id} style={styles.mealItem}>
        <Pressable
          style={styles.mealContent}
          onPress={() => router.push(`/(meal)/${meal.id}`)}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.mealImage}
              resizeMode="cover"
              onError={(error) => {
                console.log("Image failed to load:", imageUrl, error);
              }}
            />
          ) : (
            <View style={[styles.mealImage, styles.placeholderImage]} />
          )}
          <View style={styles.mealInfo}>
            <Text style={styles.mealTitle}>{meal.title}</Text>
            <View style={styles.mealDetails}>
              {meal.nutrition?.calories && (
                <Text style={styles.mealDetailText}>
                  {Math.round(meal.nutrition.calories)} cal
                </Text>
              )}
              <Text>|</Text>
              {meal.readyInMinutes && (
                <Text style={styles.mealDetailText}>
                  {meal.readyInMinutes} min
                </Text>
              )}
            </View>
            {/* Macronutrients */}
            {(carbs || protein || fat) && (
              <View style={styles.macrosContainer}>
                {carbs && (
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Carbs</Text>
                    <Text style={styles.macroValue}>{carbs}</Text>
                  </View>
                )}
                {protein && (
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Protein</Text>
                    <Text style={styles.macroValue}>{protein}</Text>
                  </View>
                )}
                {fat && (
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Fat</Text>
                    <Text style={styles.macroValue}>{fat}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </Pressable>
        <CustomButton
          containerStyle={styles.replaceButton}
          onPress={handleReplace}
        >
          <ReplaceIcon />
        </CustomButton>
      </View>
    );
  };

  const handleGenerateWithAI = (mealType: MealType) => {
    router.push({
      pathname: "/(plan)/ai-plan",
      params: {
        mealType,
        startDate: formatDate(planStartDate),
        endDate: formatDate(planEndDate),
      },
    });
  };

  const renderEmptyMealState = (mealType: MealType) => {
    const mealTypeLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

    return (
      <View key={mealType}>
        <Text style={styles.mealTypeHeader}>{mealTypeLabel}</Text>
        <View style={styles.skeletonMealItem}>
          {/* Skeleton Image */}
          <View style={styles.skeletonImage}>
            <MaterialIcons name="image" size={28} color={Colors.gray[400]} />
          </View>
          {/* Skeleton Content */}
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonTitleLine} />
            <View style={styles.skeletonDetailLine} />
            {/* AI Generate Button */}
            <Pressable
              style={styles.aiGenerateButton}
              onPress={() => handleGenerateWithAI(mealType)}
            >
              <MaterialIcons name="auto-awesome" size={16} color="#fff" />
              <Text style={styles.aiGenerateButtonText}>Generate with AI</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderDayMeals = (mealType: MealType) => {
    const dayData = mealPlan?.[mealType];

    // Show empty state if no results
    if (!dayData || dayData.results.length === 0) {
      return renderEmptyMealState(mealType);
    }

    const currentIndex = selectedMealIndices[mealType] ?? 0;
    const currentMeal = dayData.results[currentIndex];

    if (!currentMeal) return null;

    return (
      <View key={mealType}>
        <Text style={styles.mealTypeHeader}>
          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </Text>
        {renderMealItem(currentMeal, mealType)}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Meal plan preview</Text>
        <Pressable onPress={() => router.dismissTo("/")}>
          <Text style={styles.closeButton}>Close</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.description}>
          Here are the recipes we&apos;ve chosen for your meal plan. Feel free
          to swap out any that you don&apos;t like!
        </Text>

        {/* Meal Types */}
        {renderDayMeals("breakfast")}
        {renderDayMeals("lunch")}
        {renderDayMeals("dinner")}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <CustomButton
          containerStyle={styles.saveButton}
          onPress={handleSaveMealPlan}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save Meal Plan"}
          </Text>
        </CustomButton>
      </View>

      <MealSelectionModal
        ref={mealSelectionRef}
        meals={modalMeals}
        selectedIndex={-1}
        title={modalTitle}
        onSelect={handleMealSelect}
        onDismiss={handleModalDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  closeButton: {
    fontSize: 16,
    color: Colors.lilac[600],
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    marginVertical: 12,
  },
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  mealContent: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
  },
  mealImage: {
    width: 73,
    height: 73,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
  },
  placeholderImage: {
    backgroundColor: Colors.gray[300],
  },
  mealInfo: {
    flex: 1,
    gap: 6,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: Colors.text.primary,
  },
  mealDetails: {
    flexDirection: "row",
    gap: 12,
  },
  mealDetailText: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
    color: Colors.text.secondary,
  },
  mealBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 1,
    borderRadius: 16,
    borderWidth: 1,
  },
  mealBadgeText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#000000",
  },
  mealTypeHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#141217",
    marginTop: 20,
  },
  skeletonMealItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  skeletonImage: {
    width: 73,
    height: 73,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderStyle: "dashed",
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonTitleLine: {
    height: 16,
    width: "70%",
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
  },
  skeletonDetailLine: {
    height: 12,
    width: "40%",
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
  },
  aiGenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: Colors.lilac[900],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  aiGenerateButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  replaceButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lilac[900],
    borderRadius: 8,
  },
  macrosContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.background.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 16,
    color: Colors.gray[500],
  },
  macroValue: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
    color: Colors.lilac[900],
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveButton: {
    backgroundColor: Colors.lilac[900],
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    color: "#fff",
    textAlign: "center",
  },
});
