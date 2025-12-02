import { Colors } from "@/constants/theme";
import {
  DateMealRow,
  fetchRecipes,
  MealSelectionHeader,
  MealTypeLabels,
} from "@/features/meal-plan";
import type { MealType, MealTypeOption } from "@/features/meal-plan/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { usePantryQuery } from "@/hooks/use-pantry-query";
import { getUserOnboardingProfile } from "@/lib/supabase-onboarding";
import CustomButton from "@/shared/components/custom-button";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MEAL_TYPE_OPTIONS: MealTypeOption[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
];

export default function SelectMeals() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { session } = useAuthContext();
  const userId = session?.user?.id;

  const { data: onboardingData } = useQuery({
    queryKey: ["onboardingProfile", userId],
    queryFn: () => getUserOnboardingProfile(userId!),
    enabled: !!userId,
  });

  const { data: pantryData } = usePantryQuery();

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

  async function handleFetchRecipes() {
    const results = await fetchRecipes(
      onboardingData,
      pantryData,
      selectedMealTypes
    );
    // TODO: Handle results (e.g., navigate to preview or update state)
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

          <Button title="Test Fetch Recipes" onPress={handleFetchRecipes} />
          <Button
            title="go to preview"
            onPress={() => router.push("/preview")}
          />
          <Button
            title="Log Pantry Data"
            onPress={() => {
              console.log("=== MANUAL PANTRY LOG ===");
              console.log("Pantry items count:", pantryData?.length || 0);

              const spoonacularNames =
                pantryData
                  ?.map((item) => item.spoonacular_name)
                  .filter((name) => name)
                  .join(",") || "";

              console.log("Spoonacular names:", spoonacularNames);
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

      <View style={styles.footer}>
        <CustomButton
          containerStyle={styles.createButton}
          onPress={() => router.push("/preview")}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </CustomButton>
      </View>
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
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  createButton: {
    paddingVertical: 14,
    backgroundColor: Colors.lilac[900],
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.background.primary,
  },
});
