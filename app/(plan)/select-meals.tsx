import { Colors } from "@/constants/theme";
import { CUISINES } from "@/lib/constants";
import CustomButton from "@/shared/components/custom-button";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Meal {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes?: number;
  nutrition?: {
    nutrients?: {
      name: string;
      amount: number;
      unitShort: string;
    }[];
    calories?: number;
    carbs?: number;
    fat?: number;
    protein?: number;
  };
  summary?: string;
}

type MealType = "breakfast" | "lunch" | "dinner";

interface MealTypeOption {
  id: MealType;
  label: string;
}

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

  const [isGenerating, setIsGenerating] = useState(false);

  const toggleMealType = (mealType: MealType) => {
    setSelectedMealTypes((prev) => ({
      ...prev,
      [mealType]: !prev[mealType],
    }));
  };

  const handleGenerateMealPlan = async () => {
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

    setIsGenerating(true);

    try {
      const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;

      if (!API_KEY) {
        throw new Error("Spoonacular API key is not configured");
      }

      const mealPlan: Record<
        MealType,
        { results: Meal[]; totalResults: number }
      > = {
        breakfast: {
          results: [],
          totalResults: 0,
        },
        lunch: {
          results: [],
          totalResults: 0,
        },
        dinner: {
          results: [],
          totalResults: 0,
        },
      };

      const includedCuisines = [CUISINES.MEDITERRANEAN];
      const excludedIngredients = ["pork", "shellfish"];

      // Different ingredients for each meal type
      const mealTypesConfig: {
        type: MealType;
        includedIngredients: string[];
      }[] = [
        {
          type: "breakfast",
          includedIngredients: ["eggs"],
        },
        {
          type: "lunch",
          includedIngredients: ["chicken"],
        },
        {
          type: "dinner",
          includedIngredients: ["fish"],
        },
      ];

      // Fetch recipes only for selected meal types
      const selectedMealTypesConfig = mealTypesConfig.filter(
        (meal) => selectedMealTypes[meal.type]
      );

      for (const meal of selectedMealTypesConfig) {
        // Build query parameters
        const params = new URLSearchParams({
          apiKey: API_KEY,
          addRecipeInformation: "true",
          number: "12",
          fillNutrients: "true",
        });

        if (includedCuisines.length > 0) {
          params.append("cuisine", includedCuisines.join(","));
        }

        if (excludedIngredients.length > 0) {
          params.append("excludeIngredients", excludedIngredients.join(","));
        }

        if (meal.type) {
          params.append("type", meal.type);
        }

        if (meal.includedIngredients.length > 0) {
          params.append(
            "includeIngredients",
            meal.includedIngredients.join(",")
          );
        }

        const response = await fetch(
          `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        console.log(`${meal.type} API Response:`, data);

        // Process results to extract calorie information from summary
        const processedResults = data.results.map((recipe: any) => {
          let calories: number | undefined;

          // Try to extract calories from summary (e.g., "343 calories")
          if (recipe.summary) {
            const calorieMatch = recipe.summary.match(/(\d+)\s+calories/i);
            if (calorieMatch) {
              calories = parseInt(calorieMatch[1], 10);
            }
          }

          return {
            ...recipe,
            nutrition: {
              calories,
            },
          };
        });

        // Assign results to the appropriate meal type
        mealPlan[meal.type].results = processedResults;
        mealPlan[meal.type].totalResults = data.totalResults;
      }

      console.log("Generated Meal Plan:", mealPlan);

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
    } finally {
      setIsGenerating(false);
    }
  };

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
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Create meal plan</Text>
        <Pressable onPress={() => router.dismissTo("/")}>
          <Text style={styles.closeButton}>Close</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Below are the meals we will include in your plan. You can make any
            modifications here.
          </Text>

          {/* Meal Types Header */}
          <View style={styles.mealTypesHeaderContainer}>
            <View style={styles.emptyLabelSpace}></View>

            <View style={styles.mealTypesLabelsContainer}>
              {MEAL_TYPE_OPTIONS.map((option) => {
                return (
                  <View key={option.id} style={styles.mealTypeLabel}>
                    <Text style={styles.mealTypeLabelText}>{option.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Date Row with Meal Selections */}
          <View style={styles.dateRowContainer}>
            <View style={styles.dateInfoContainer}>
              <Text style={styles.dateDayText}>
                {new Date(params.startDate as string).toLocaleDateString(
                  "en-US",
                  { weekday: "short" }
                )}
              </Text>
              <Text style={styles.dateLabelText}>
                {new Date(params.startDate as string).toLocaleDateString(
                  "en-US",
                  { weekday: "short", day: "numeric" }
                )}
              </Text>
            </View>

            <View style={styles.mealSelectionCardsContainer}>
              {MEAL_TYPE_OPTIONS.map((option) => {
                const isSelected = selectedMealTypes[option.id];

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => toggleMealType(option.id)}
                    style={[
                      styles.mealSelectionCard,
                      isSelected
                        ? styles.mealSelectionCardSelected
                        : styles.mealSelectionCardUnselected,
                    ]}
                  >
                    <View
                      style={[isSelected && styles.selectionCheckboxSelected]}
                    >
                      {isSelected && (
                        <View style={styles.selectionCheckboxSelected}>
                          <MaterialIcons
                            name="check"
                            size={16}
                            color={Colors.green[600]}
                          />
                        </View>
                      )}
                      {!isSelected && (
                        <MaterialIcons
                          name="no-meals"
                          size={24}
                          color={Colors.gray[500]}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <CustomButton
          containerStyle={styles.createButton}
          onPress={handleGenerateMealPlan}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={Colors.background.primary} />
          ) : (
            <Text style={styles.createButtonText}>Create</Text>
          )}
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
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
  // Meal Types Header Styles
  mealTypesHeaderContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 32,
  },
  emptyLabelSpace: {
    width: 60,
  },
  mealTypesLabelsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  mealTypeLabel: {
    flex: 1,
  },
  mealTypeLabelText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 24,
    textAlign: "center",
    color: Colors.text.primary,
  },
  // Date Row Styles
  dateRowContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 32,
    marginTop: 8,
  },
  dateInfoContainer: {
    flexDirection: "column",
    gap: 0,
    paddingHorizontal: 1,
    width: 60,
  },
  dateDayText: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    color: Colors.text.primary,
  },
  dateLabelText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 24,
    color: "#737780",
  },
  // Meal Selection Cards Styles
  mealSelectionCardsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  mealSelectionCard: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  selectionCheckboxSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  mealSelectionCardSelected: {
    backgroundColor: "#D2E6CE",
  },
  mealSelectionCardUnselected: {
    backgroundColor: "#E1D9EE",
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
