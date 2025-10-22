import { Colors } from "@/constants/theme";
import { DateModal } from "@/features/meal-plan/components/date-modal";
import { CUISINES } from "@/lib/constants";

import CustomButton from "@/shared/components/custom-button";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
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

export default function CreateMealPlan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const startDateModalRef = useRef<BottomSheetModal>(null);
  const endDateModalRef = useRef<BottomSheetModal>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [startDate, setStartDate] = useState<Date>(new Date(today));
  const [endDate, setEndDate] = useState<Date>(
    new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)
  ); // 6 days from now
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealPlanData, setMealPlanData] = useState<any>(null);

  const formatDateDisplay = (date: Date): { day: string; date: string } => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = daysOfWeek[date.getDay()];
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const dateNum = date.getDate();
    return {
      day: dayName,
      date: `${month}, ${dateNum}`,
    };
  };

  const startDateDisplay = formatDateDisplay(startDate);
  const endDateDisplay = formatDateDisplay(endDate);

  const handleStartDatePress = () => {
    startDateModalRef.current?.present();
  };

  const handleEndDatePress = () => {
    endDateModalRef.current?.present();
  };

  const handleStartDateSelect = (date: Date) => {
    setStartDate(date);
    startDateModalRef.current?.close();
    // If end date is before or equal to new start date, update it
    if (endDate <= date) {
      const newEndDate = new Date(date);
      newEndDate.setDate(newEndDate.getDate() + 6);
      setEndDate(newEndDate);
    }
  };

  const handleEndDateSelect = (date: Date) => {
    setEndDate(date);
    endDateModalRef.current?.close();
  };

  const handleGenerateMealPlan = async () => {
    setIsGenerating(true);
    setMealPlanData(null);

    try {
      const API_KEY = "fc1057b7d70f4475a7c41d1edc8368a5";

      const mealPlan = {
        breakfast: {
          results: [] as Meal[],
          totalResults: 0,
        },
        lunch: {
          results: [] as Meal[],
          totalResults: 0,
        },
        dinner: {
          results: [] as Meal[],
          totalResults: 0,
        },
      };

      const includedCuisines = [CUISINES.MEDITERRANEAN];
      const excludedIngredients = ["pork", "shellfish"];

      // Different ingredients for each meal type
      const mealTypes = [
        {
          type: "breakfast",
          includedIngredients: ["eggs", "spinach"],
        },
        {
          type: "lunch",
          includedIngredients: ["chicken", "vegetables"],
        },
        {
          type: "dinner",
          includedIngredients: ["fish", "rice"],
        },
      ];

      // Fetch recipes for each meal type
      for (const meal of mealTypes) {
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
        mealPlan[meal.type as keyof typeof mealPlan].results = processedResults;
        mealPlan[meal.type as keyof typeof mealPlan].totalResults =
          data.totalResults;
      }

      console.log("Generated Meal Plan:", mealPlan);
      setMealPlanData(mealPlan);

      // Navigate to preview with meal plan data
      setTimeout(() => {
        router.push({
          pathname: "/preview",
          params: {
            mealPlanData: JSON.stringify(mealPlan),
          },
        });
      }, 500);
    } catch (error) {
      console.error("Error generating meal plan:", error);
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Meal plan dates</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeButton}>Close</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.description}>
            We&apos;ll create a meal plan for the week. Feel free to modify the
            start or end date as you need.
          </Text>

          <View style={styles.datesContainer}>
            {/* Start Date */}
            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>Start</Text>
              <CustomButton
                containerStyle={styles.dateButton}
                onPress={handleStartDatePress}
              >
                <View style={styles.dateContent}>
                  <Text style={styles.dayText}>{startDateDisplay.day}</Text>
                  <Text style={styles.dateText}>{startDateDisplay.date}</Text>
                </View>
                <MaterialIcons
                  name="expand-more"
                  size={24}
                  color={Colors.text.primary}
                />
              </CustomButton>
            </View>

            {/* End Date */}
            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>End</Text>
              <CustomButton
                containerStyle={styles.dateButton}
                onPress={handleEndDatePress}
              >
                <View style={styles.dateContent}>
                  <Text style={styles.dayText}>{endDateDisplay.day}</Text>
                  <Text style={styles.dateText}>{endDateDisplay.date}</Text>
                </View>
                <MaterialIcons
                  name="expand-more"
                  size={24}
                  color={Colors.text.primary}
                />
              </CustomButton>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          containerStyle={[styles.generateButton]}
          onPress={handleGenerateMealPlan}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={Colors.background.primary} />
          ) : (
            <Text style={styles.generateButtonText}>Generate Meal Plan</Text>
          )}
        </CustomButton>

        {mealPlanData && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Generated Meal Plan:</Text>
            <ScrollView
              style={styles.resultScrollView}
              nestedScrollEnabled={true}
            >
              <Text style={styles.resultText}>
                {JSON.stringify(mealPlanData, null, 2)}
              </Text>
            </ScrollView>
          </View>
        )}
      </View>

      <DateModal
        ref={startDateModalRef}
        dateType="start"
        currentDate={startDate}
        onDateSelect={handleStartDateSelect}
      />
      <DateModal
        ref={endDateModalRef}
        dateType="end"
        selectedStartDate={startDate}
        currentDate={endDate}
        onDateSelect={handleEndDateSelect}
      />
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
  datesContainer: {
    flexDirection: "row",
    gap: 16,
  },
  dateSection: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.lilac[300],
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dateContent: {
    flex: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.text.primary,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  generateButton: {
    paddingVertical: 14,
    backgroundColor: Colors.lilac[900],
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.background.primary,
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 16,
    maxHeight: 300,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  resultScrollView: {
    maxHeight: 250,
  },
  resultText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
