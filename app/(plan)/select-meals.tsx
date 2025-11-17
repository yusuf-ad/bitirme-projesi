import { Colors } from "@/constants/theme";
import {
  DateMealRow,
  MealPlanFooter,
  MealSelectionHeader,
  MealTypeLabels,
  useMealPlanGenerator,
} from "@/features/meal-plan";
import type { MealType, MealTypeOption } from "@/features/meal-plan/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MEAL_TYPE_OPTIONS: MealTypeOption[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
];

export default function SelectMeals() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [selectedMealTypes, setSelectedMealTypes] = useState<
    Record<MealType, boolean>
  >({
    breakfast: true,
    lunch: true,
    dinner: true,
  });

  const { generateMealPlan, isGenerating } = useMealPlanGenerator({
    selectedMealTypes,
  });

  function toggleMealType(mealType: MealType) {
    setSelectedMealTypes((prev) => ({
      ...prev,
      [mealType]: !prev[mealType],
    }));
  }

  async function handleGenerateMealPlan() {
    // Validate at least one meal type is selected
    const hasSelectedMealType = Object.values(selectedMealTypes).some(
      (isSelected) => isSelected
    );

    if (!hasSelectedMealType) {
      Alert.alert(
        "No meal types selected",
        "Please select at least one meal type."
      );
      return;
    }

    try {
      const mealPlan = await generateMealPlan();

      // Navigate to preview with meal plan data
      router.push({
        pathname: "/preview",
        params: {
          mealPlanData: JSON.stringify(mealPlan),
          startDate: params.startDate as string,
          endDate: params.startDate as string, // Same as start date for 1-day plan
        },
      });
    } catch (error) {
      console.error("Error generating meal plan:", error);
      Alert.alert(
        "Error generating meal plan",
        "Please try again in a moment."
      );
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

          <MealTypeLabels mealTypes={MEAL_TYPE_OPTIONS} />

          <DateMealRow
            date={params.startDate as string}
            mealTypes={MEAL_TYPE_OPTIONS}
            selectedMealTypes={selectedMealTypes}
            onToggleMealType={toggleMealType}
          />
        </View>
      </ScrollView>

      <MealPlanFooter
        onCreatePress={handleGenerateMealPlan}
        isGenerating={isGenerating}
      />
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
    paddingVertical: 28,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    marginBottom: 24,
    fontWeight: "400",
  },
});
