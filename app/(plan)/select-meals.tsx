import { CelebrationModal } from "@/components/CelebrationModal";
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
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
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

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingNavigationParams, setPendingNavigationParams] = useState<any>(null);

  const handleModalAction = () => {
    setShowSuccessModal(false);
    if (pendingNavigationParams) {
      router.push(pendingNavigationParams);
    }
  };

  function toggleMealType(mealType: MealType) {
    setSelectedMealTypes((prev) => ({
      ...prev,
      [mealType]: !prev[mealType],
    }));
  }

  async function handleCreateMealPlan() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const results = await fetchRecipes(
        onboardingData,
        pantryData,
        selectedMealTypes
      );

      if (!results || results.length === 0) {
        console.warn("No recipes found");
        setIsLoading(false);
        return;
      }

      // Transform results array into MealPlan object format
      const mealPlanData: Record<
        string,
        { results: any[]; totalResults: number }
      > = {};

      for (const result of results) {
        mealPlanData[result.mealType] = {
          results: result.results,
          totalResults:
            result.results[0]?.totalResults || result.results.length,
        };
      }

      // Navigate to preview with the meal plan data
      // Store the pending navigation parameters in state
      setPendingNavigationParams({
        pathname: "/preview",
        params: {
          startDate: params.startDate as string,
          endDate: (params.endDate as string) || (params.startDate as string),
          mealPlanData: JSON.stringify(mealPlanData),
        },
      });

      // Show celebration modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating meal plan:", error);
    } finally {
      setIsLoading(false);
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

      <View style={styles.footer}>
        <CustomButton
          containerStyle={[
            styles.createButton,
            isLoading && styles.createButtonDisabled,
          ]}
          onPress={handleCreateMealPlan}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.background.primary} />
          ) : (
            <Text style={styles.createButtonText}>Create</Text>
          )}
        </CustomButton>
      </View>
      <CelebrationModal
        visible={showSuccessModal}
        type="meal-plan-created"
        onClose={() => setShowSuccessModal(false)}
        onAction={handleModalAction}
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
  createButtonDisabled: {
    opacity: 0.7,
  },
});
