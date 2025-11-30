import { Colors } from "@/constants/theme";
import {
  DateMealRow,
  MealSelectionHeader,
  MealTypeLabels,
} from "@/features/meal-plan";
import type { MealType, MealTypeOption } from "@/features/meal-plan/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { usePantryQuery } from "@/hooks/use-pantry-query";
import { MEAL_TYPES } from "@/lib/constants";
import { getIngredientInformation } from "@/lib/spoonacular";
import { searchRecipesComplex } from "@/lib/spoonacular-complex-search";
import { getUserOnboardingProfile } from "@/lib/supabase-onboarding";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MEAL_TYPE_OPTIONS: MealTypeOption[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
];

const SPOONACULAR_TYPE_MAPPING: Record<MealType, string> = {
  breakfast: MEAL_TYPES.BREAKFAST,
  lunch: `${MEAL_TYPES.MAIN_COURSE},${MEAL_TYPES.SALAD},${MEAL_TYPES.SOUP}`,
  dinner: MEAL_TYPES.MAIN_COURSE,
};

export default function SelectMeals() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { session } = useAuthContext();
  const userId = session?.user?.id;

  const { data: onboardingData, isLoading } = useQuery({
    queryKey: ["onboardingProfile", userId],
    queryFn: () => getUserOnboardingProfile(userId!),
    enabled: !!userId,
  });

  const { data: pantryData, isLoading: isPantryLoading } = usePantryQuery();

  useEffect(() => {
    if (pantryData) {
      console.log("=== PANTRY DATA FETCHED ===");
      console.log("Pantry items count:", pantryData.length);

      // Extract spoonacular names and log as comma-separated string
      const spoonacularNames = pantryData
        .map((item) => item.spoonacular_name)
        .filter((name) => name) // Filter out any empty/null names
        .join(",");

      console.log("Spoonacular names:", spoonacularNames);
    }
  }, [pantryData]);

  const [selectedMealTypes, setSelectedMealTypes] = useState<
    Record<MealType, boolean>
  >({
    breakfast: true,
    lunch: true,
    dinner: true,
  });

  function toggleMealType(mealType: MealType) {
    setSelectedMealTypes((prev) => ({
      ...prev,
      [mealType]: !prev[mealType],
    }));
  }

  async function fetchRecipes() {
    try {
      if (!onboardingData) {
        console.warn("Onboarding data is not ready yet.");
        return;
      }

      console.log("Fetching recipes with user preferences...");

      // 1. Prepare User Preferences
      const preferences = onboardingData.tastePreferences;
      const goals = onboardingData.goals?.goal_ids || [];

      // Cuisines
      const cuisineParam = preferences?.cuisines?.join(",");

      // Diets
      const dietParam = preferences?.diet_preferences?.join(",");

      // Allergies / Dislikes (Fetch names from IDs)
      const allergyIds = preferences?.allergies_dislikes || [];
      const allergyNames: string[] = [];

      if (allergyIds.length > 0) {
        console.log("Fetching allergy ingredient names...");
        for (let i = 0; i < allergyIds.length; i++) {
          try {
            const id = parseInt(allergyIds[i]);
            if (!isNaN(id)) {
              const info = await getIngredientInformation(id);
              if (info.name) {
                allergyNames.push(info.name);
              }
            }
          } catch (e) {
            console.error(
              `Failed to fetch info for allergy ID ${allergyIds[i]}`,
              e
            );
          }
        }
      }

      const excludeIngredientsParam = allergyNames.join(",");
      console.log("Exclude Ingredients:", excludeIngredientsParam);

      // 2. Prepare Pantry Ingredients (Include in recipes)
      const includeIngredientsParam = pantryData
        ?.map((item) => item.spoonacular_name)
        .filter((name) => name)
        .join(",");
      console.log(
        "Include Ingredients (from pantry):",
        includeIngredientsParam
      );

      // Filter only selected meal types
      const activeTypes = (Object.keys(selectedMealTypes) as MealType[]).filter(
        (type) => selectedMealTypes[type]
      );

      const results = [];

      for (let i = 0; i < activeTypes.length; i++) {
        const mealType = activeTypes[i];
        const apiType = SPOONACULAR_TYPE_MAPPING[mealType];

        console.log(`Fetching ${mealType}...`);

        const response = await searchRecipesComplex({
          // Dynamic Parameters from Onboarding
          cuisine: cuisineParam,
          diet: dietParam,
          includeIngredients: includeIngredientsParam, // Add pantry ingredients
          excludeIngredients: excludeIngredientsParam,
          sort: "max-used-ingredients",

          // Standard Parameters
          type: apiType,
          number: 3,
          addRecipeNutrition: true,
          ignorePantry: false, // Don't ignore pantry since we're including our own
          fillIngredients: false,
        });

        results.push({
          mealType,
          results: response.results.map((recipe) => {
            const nutrients = recipe.nutrition?.nutrients || [];
            const getNutrient = (name: string) =>
              nutrients.find((n) => n.name === name)?.amount || 0;

            return {
              id: recipe.id,
              title: recipe.title,
              image: recipe.image,
              readyInMinutes: recipe.readyInMinutes,
              mealType: mealType,
              type: recipe.dishTypes,
              nutrition: {
                calories: getNutrient("Calories"),
                protein: getNutrient("Protein"),
                fat: getNutrient("Fat"),
                carbs: getNutrient("Carbohydrates"),
              },
            };
          }),
        });
      }

      results.forEach((result) => {
        console.log(
          `\n=== ${result.mealType.toUpperCase()} RESULTS ===`,
          JSON.stringify(result.results, null, 2)
        );
      });
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors.background.primary,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <MealSelectionHeader />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Below are the meals we will include in your plan. You can make any
            modifications here.
          </Text>

          <Button title="Test Fetch Recipes" onPress={fetchRecipes} />
          <Button
            title="go to preview"
            onPress={() => router.push("/preview")}
          />
          <Button
            title="Log Pantry Data"
            onPress={() => {
              console.log("=== MANUAL PANTRY LOG ===");
              console.log("Pantry items count:", pantryData?.length || 0);

              // Extract spoonacular names and log as comma-separated string
              const spoonacularNames =
                pantryData
                  ?.map((item) => item.spoonacular_name)
                  .filter((name) => name) // Filter out any empty/null names
                  .join(",") || "";

              console.log("Spoonacular names:", spoonacularNames);

              // Also log the full data for reference
              console.log(
                "Full pantry items:",
                JSON.stringify(pantryData, null, 2)
              );
            }}
          />

          <MealTypeLabels mealTypes={MEAL_TYPE_OPTIONS} />

          <DateMealRow
            date={params.startDate as string}
            mealTypes={MEAL_TYPE_OPTIONS}
            selectedMealTypes={selectedMealTypes}
            onToggleMealType={toggleMealType}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    marginBottom: 24,
    fontWeight: "400",
  },
});
