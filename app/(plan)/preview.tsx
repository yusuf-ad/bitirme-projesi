import ReplaceIcon from "@/assets/icons/replace-icon";
import { Colors } from "@/constants/theme";
import type { MealSelectionModalHandle } from "@/features/meal-plan/components/meal-selection-modal";
import { MealSelectionModal } from "@/features/meal-plan/components/meal-selection-modal";
import { useAuthContext } from "@/hooks/use-auth-context";
import { CUISINES } from "@/lib/constants";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SPOONACULAR_ENDPOINT =
  "https://api.spoonacular.com/recipes/complexSearch";
const DEFAULT_CUISINES = [CUISINES.MEDITERRANEAN];
const EXCLUDED_INGREDIENTS = ["pork", "shellfish"];
const MEAL_TYPE_INGREDIENTS: Record<MealType, string[]> = {
  breakfast: ["eggs"],
  lunch: ["chicken"],
  dinner: ["fish"],
};

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

interface MealFetchResult {
  results: Meal[];
  totalResults: number;
}

const fetchMealsForType = async (
  mealType: MealType
): Promise<MealFetchResult> => {
  const apiKey = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;

  if (!apiKey) {
    throw new Error("Spoonacular API key is not configured");
  }

  const params = new URLSearchParams({
    apiKey,
    addRecipeInformation: "true",
    number: "12",
    fillNutrients: "true",
    sort: "random",
    type: mealType,
  });

  if (DEFAULT_CUISINES.length > 0) {
    params.append("cuisine", DEFAULT_CUISINES.join(","));
  }

  const includedIngredients = MEAL_TYPE_INGREDIENTS[mealType] ?? [];
  if (includedIngredients.length > 0) {
    params.append("includeIngredients", includedIngredients.join(","));
  }

  if (EXCLUDED_INGREDIENTS.length > 0) {
    params.append("excludeIngredients", EXCLUDED_INGREDIENTS.join(","));
  }

  const response = await fetch(`${SPOONACULAR_ENDPOINT}?${params.toString()}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Spoonacular request failed with status ${response.status}`
    );
  }

  const data = await response.json();

  const processedResults: Meal[] = (
    Array.isArray(data.results) ? data.results : []
  ).map((recipe: any) => {
    const nutrientCalories = Array.isArray(recipe?.nutrition?.nutrients)
      ? recipe.nutrition.nutrients.find(
          (nutrient: any) =>
            typeof nutrient?.name === "string" &&
            nutrient.name.toLowerCase() === "calories"
        )
      : undefined;

    let calories: number | undefined = nutrientCalories?.amount;

    if (!calories && typeof recipe?.nutrition?.calories === "number") {
      calories = recipe.nutrition.calories;
    }

    if (!calories && typeof recipe?.summary === "string") {
      const calorieMatch = recipe.summary.match(/(\d+)\s+calories/i);
      if (calorieMatch) {
        calories = parseInt(calorieMatch[1], 10);
      }
    }

    const baseNutrition: Record<string, unknown> =
      recipe && typeof recipe.nutrition === "object" && recipe.nutrition
        ? recipe.nutrition
        : {};

    return {
      ...recipe,
      nutrition: {
        ...baseNutrition,
        calories,
      },
    } as Meal;
  });

  return {
    results: processedResults,
    totalResults:
      typeof data.totalResults === "number"
        ? data.totalResults
        : processedResults.length,
  };
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
  const [selectedMealIndices, setSelectedMealIndices] = useState<{
    breakfast: number;
    lunch: number;
    dinner: number;
  }>({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  });
  const [activeMealType, setActiveMealType] = useState<MealType | null>(null);
  const [loadingMealType, setLoadingMealType] = useState<MealType | null>(null);

  const planStartDate = normalizeDateParam(params.startDate);
  const planEndDate = normalizeDateParam(params.endDate ?? params.startDate);

  const modalMeals = activeMealType
    ? mealPlan?.[activeMealType]?.results ?? []
    : [];
  const modalSelectedIndex = activeMealType
    ? selectedMealIndices[activeMealType] ?? 0
    : 0;

  const modalTitle = activeMealType
    ? `Replace ${activeMealType.charAt(0).toUpperCase()}${activeMealType.slice(
        1
      )}`
    : "Select a meal";

  const handleMealSelect = useCallback(
    (index: number) => {
      if (!activeMealType) return;

      setSelectedMealIndices((prev) => ({
        ...prev,
        [activeMealType]: index,
      }));
      setLoadingMealType(null);
      mealSelectionRef.current?.dismiss();
    },
    [activeMealType]
  );

  const handleModalDismiss = useCallback(() => {
    setActiveMealType(null);
    setLoadingMealType(null);
  }, []);

  const handleGenerateMoreMeals = useCallback(async () => {
    if (!activeMealType || !mealPlan) {
      return;
    }

    if (loadingMealType === activeMealType) {
      return;
    }

    try {
      setLoadingMealType(activeMealType);
      const mealLabel =
        activeMealType.charAt(0).toUpperCase() + activeMealType.slice(1);
      const { results, totalResults } = await fetchMealsForType(activeMealType);

      if (results.length === 0) {
        Alert.alert(
          "No recipes found",
          `We couldn't find new ${mealLabel} recipes right now.`
        );
        return;
      }

      setMealPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [activeMealType]: {
            results,
            totalResults,
          },
        };
      });

      setSelectedMealIndices((prev) => ({
        ...prev,
        [activeMealType]: 0,
      }));
    } catch (error) {
      console.error("Failed to generate recipes:", error);
      Alert.alert(
        "Unable to generate recipes",
        "Please try again in a moment."
      );
    } finally {
      setLoadingMealType(null);
    }
  }, [activeMealType, mealPlan, loadingMealType]);

  useEffect(() => {
    if (params.mealPlanData) {
      try {
        const data = JSON.parse(params.mealPlanData as string);

        // Check if data has breakfast, lunch, dinner structure
        if (
          data &&
          data.breakfast &&
          data.lunch &&
          data.dinner &&
          data.breakfast.results &&
          data.lunch.results &&
          data.dinner.results
        ) {
          setMealPlan(data);
          setSelectedMealIndices({
            breakfast: 0,
            lunch: 0,
            dinner: 0,
          });
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

    const breakfastMealItem = createMealItem(
      mealPlan,
      "breakfast",
      selectedMealIndices.breakfast,
      planStartDate
    );
    const lunchMealItem = createMealItem(
      mealPlan,
      "lunch",
      selectedMealIndices.lunch,
      planStartDate
    );
    const dinnerMealItem = createMealItem(
      mealPlan,
      "dinner",
      selectedMealIndices.dinner,
      planStartDate
    );

    if (!breakfastMealItem || !lunchMealItem || !dinnerMealItem) {
      Alert.alert(
        "Missing recipes",
        "Select a recipe for each meal before saving."
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
        Alert.alert(
          "Meal plan already exists",
          "You already have a meal plan for this date range."
        );
        return;
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

      const itemsPayload = [
        breakfastMealItem,
        lunchMealItem,
        dinnerMealItem,
      ].map((item) => ({
        ...item,
        meal_plan_id: newPlan.id,
      }));

      const { error: itemsError } = await supabase
        .from("meal_plan_items")
        .insert(itemsPayload);

      if (itemsError) {
        throw itemsError;
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

      setLoadingMealType(null);
      setActiveMealType(mealType);
      mealSelectionRef.current?.present();
    };

    return (
      <View key={meal.id} style={styles.mealItem}>
        <View style={styles.mealContent}>
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
          </View>
        </View>
        <CustomButton
          containerStyle={styles.replaceButton}
          onPress={handleReplace}
        >
          <ReplaceIcon />
        </CustomButton>
      </View>
    );
  };

  const renderDayMeals = (mealType: MealType) => {
    const dayData = mealPlan?.[mealType];

    if (!dayData || dayData.results.length === 0) return null;

    const currentIndex = selectedMealIndices[mealType];
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
        <View style={styles.headerLeft}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.text.primary}
            onPress={() => router.back()}
          />
        </View>
        <Text style={styles.headerTitle}>Meal plan preview</Text>
        <View style={styles.headerRight} />
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
        selectedIndex={modalSelectedIndex}
        title={modalTitle}
        onSelect={handleMealSelect}
        onDismiss={handleModalDismiss}
        onGenerateMore={activeMealType ? handleGenerateMoreMeals : undefined}
        isGeneratingMore={loadingMealType === activeMealType}
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
    paddingVertical: 8,
  },
  headerLeft: {
    width: 48,
    height: 48,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },
  headerRight: {
    width: 48,
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
    marginBottom: 12,
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
  replaceButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lilac[900],
    borderRadius: 8,
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
