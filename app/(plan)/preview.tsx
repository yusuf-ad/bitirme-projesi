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
  const mealSelectionRef = useRef<MealSelectionModalHandle>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan>();
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
    const breakfastMealItem = createMealItem(
      mealPlan,
      "breakfast",
      selectedMealIndices.breakfast
    );
    const lunchMealItem = createMealItem(
      mealPlan,
      "lunch",
      selectedMealIndices.lunch
    );
    const dinnerMealItem = createMealItem(
      mealPlan,
      "dinner",
      selectedMealIndices.dinner
    );

    const mealPlanData = {
      breakfast: breakfastMealItem,
      lunch: lunchMealItem,
      dinner: dinnerMealItem,
    };

    // TODO: Save meal plan logic
    console.log("Saving meal plan...", mealPlanData);

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const { data: planData, error: planError } = await supabase
      .from("meal_plans")
      .insert([
        {
          user_id: session?.user.id,
          name: `my meal plan ${formatDate(today)}`,
          start_date: formatDate(today),
          end_date: formatDate(tomorrow),
        },
      ])
      .select();

    console.log("Insert meal plan response:", planData);

    if (planError) {
      Alert.alert("Error saving meal plan", planError.message);
    }

    const { error: itemsError } = await supabase
      .from("meal_plan_items")
      .insert([
        { meal_plan_id: planData?.[0].id, ...breakfastMealItem },
        { meal_plan_id: planData?.[0].id, ...lunchMealItem },
        { meal_plan_id: planData?.[0].id, ...dinnerMealItem },
      ]);

    if (itemsError) {
      Alert.alert("Error saving meal items :(", itemsError.message);
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
        >
          <Text style={styles.saveButtonText}>Save Meal Plan</Text>
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
