import EnergyIcon from "@/assets/icons/energy-icon";
import { Colors } from "@/constants/theme";
import { DIET_OPTIONS } from "@/features/onboarding/sections/taste/diet-options";
import { useOnboarding } from "@/providers/onboarding-provider";
import CalorieProgressBar from "@/shared/components/calorie-progress-bar";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import MacroCardsSection from "./macro-cards-section";

interface DailyOverviewProps {
  totalCalories?: number;
  totalCarbs?: number;
  totalProtein?: number;
  totalFat?: number;
  isEmpty?: boolean;
}

export default function DailyOverview({
  totalCalories = 0,
  totalCarbs = 0,
  totalProtein = 0,
  totalFat = 0,
  isEmpty = false,
}: DailyOverviewProps) {
  const { selectedDietPreferences, dietNutritionTargets } = useOnboarding();

  const { goalCalories, goalCarbs, goalProtein, goalFat } = useMemo(() => {
    // Default values
    let targets = {
      goalCalories: 2200,
      goalCarbs: 275, // ~50%
      goalProtein: 138, // ~25%
      goalFat: 61, // ~25%
    };

    if (selectedDietPreferences.length > 0) {
      const dietId = selectedDietPreferences[0];
      const customTarget = dietNutritionTargets[dietId];

      if (customTarget) {
        // User has custom targets (already in grams)
        targets = {
          goalCalories: customTarget.calories,
          goalCarbs: customTarget.carbs,
          goalProtein: customTarget.protein,
          goalFat: customTarget.fat,
        };
      } else {
        // Fallback to diet option defaults (percentages)
        const dietOption = DIET_OPTIONS.find((d) => d.id === dietId);
        if (dietOption) {
          const cals = dietOption.targetCalories;
          targets = {
            goalCalories: cals,
            goalCarbs: Math.round(
              (cals * dietOption.defaultMacros.carbohydrates) / 4
            ),
            goalProtein: Math.round(
              (cals * dietOption.defaultMacros.protein) / 4
            ),
            goalFat: Math.round((cals * dietOption.defaultMacros.fat) / 9),
          };
        }
      }
    }

    return targets;
  }, [selectedDietPreferences, dietNutritionTargets]);

  return (
    <View style={styles.container}>
      {/* Meal Header */}
      <View style={styles.header}>
        <View style={styles.mealInfo}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <EnergyIcon
              color={isEmpty ? Colors.gray[400] : Colors.lilac[900]}
              width={16}
              height={16}
            />
            <Text
              style={[styles.mealType, isEmpty && { color: Colors.gray[500] }]}
            >
              Daily Overview
            </Text>
            {isEmpty && (
              <View style={styles.emptyBadge}>
                <Text style={styles.emptyBadgeText}>No meals</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <CalorieProgressBar
        currentValue={totalCalories}
        goalValue={goalCalories}
      />

      {/* Macro Cards */}
      <MacroCardsSection
        totalCarbs={totalCarbs}
        totalProtein={totalProtein}
        totalFat={totalFat}
        goalCarbs={goalCarbs}
        goalProtein={goalProtein}
        goalFat={goalFat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    borderRadius: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[200],
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    justifyContent: "center",
    alignItems: "center",
  },
  mealIcon: {
    width: 40,
    height: 40,
  },
  mealInfo: {
    justifyContent: "center",
    gap: 4,
  },
  mealType: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 21,
    color: Colors.text.primary,
  },
  emptyBadge: {
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  emptyBadgeText: {
    fontFamily: "Inter",
    fontSize: 10,
    fontWeight: "600",
    color: Colors.gray[600],
  },
  mealTime: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 21,
    color: Colors.gray[400],
  },
  arrowButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  recipeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  recipeImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  recipeInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipeTextContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
    padding: 4,
  },
  recipeName: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 16,
    color: Colors.text.primary,
  },
  recipeDescription: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.primary,
  },
  recipeMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaIcon: {
    width: 16,
    height: 16,
  },
  metaText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 24,
    color: Colors.gray[600],
  },
  separator: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 24,
    letterSpacing: -1,
    color: Colors.gray[600],
  },
});
