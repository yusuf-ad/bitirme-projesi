import { Colors } from "@/constants/theme";
import { useOnboarding } from "@/providers/onboarding-provider";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import CalorieProgressBar from "../../../shared/components/calorie-progress-bar";
import { DIET_OPTIONS } from "../../onboarding/sections/taste/diet-options";

interface DailyOverviewProps {
  totalCalories?: number;
  totalCarbs?: number;
  totalProtein?: number;
  totalFat?: number;
  goalCarbs?: number;
  goalProtein?: number;
  goalFat?: number;
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
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="flash" size={16} color={Colors.lilac[600]} />
        </View>
        <Text style={styles.headerTitle}>Daily Overview</Text>
      </View>

      <View style={styles.divider} />

      {/* Calories */}
      <View style={styles.calorieContainer}>
        <Text style={styles.currentCalories}>{Math.round(totalCalories)}</Text>
        <Text style={styles.goalCalories}>/{goalCalories} cal goal</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarWrapper}>
        <CalorieProgressBar
          currentValue={totalCalories}
          goalValue={goalCalories}
          filledColor={["#A78BFA", "#7C3AED"]} // Gradient Purple
          height={10}
        />
      </View>

      {/* Macros */}
      <View style={styles.macrosContainer}>
        <MacroItem
          label="Carbs"
          value={totalCarbs}
          goal={goalCarbs}
          color="#10B981" // Greenish for carbs/veg? Or stick to design colors
        />
        <MacroItem
          label="Protein"
          value={totalProtein}
          goal={goalProtein}
          color="#F59E0B" // Orange
        />
        <MacroItem
          label="Fat"
          value={totalFat}
          goal={goalFat}
          color="#EF4444" // Red
        />
      </View>
    </View>
  );
}

function MacroItem({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  return (
    <View style={styles.macroItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        <Text style={styles.macroCurrent}>{Math.round(value)}</Text>
        <Text style={styles.macroGoal}>/{goal}g</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8, // increased from 4
    paddingHorizontal: 12, // increased from 10
    paddingBottom: 12, // increased from 8
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
    marginBottom: 12, // increased from 8
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // increased from 6
    paddingVertical: 8, // increased from 6
    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[200],
    marginBottom: 8, // increased from 6
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 16, // increased from 14
    width: 16, // increased from 14
  },
  headerTitle: {
    fontFamily: "Inter",
    fontSize: 13, // increased from 12
    lineHeight: 16, // increased from 14
    fontWeight: "500",
    color: "#4B5563",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  divider: {
    display: "none",
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 6, // increased from 4
    paddingHorizontal: 4, // increased from 2
  },
  currentCalories: {
    fontFamily: "Inter",
    fontSize: 24, // increased from 20
    fontWeight: "700",
    color: "#111827",
  },
  goalCalories: {
    fontFamily: "Inter",
    fontSize: 12, // increased from 11
    fontWeight: "400",
    color: "#6B7280",
  },
  progressBarWrapper: {
    marginBottom: 12, // increased from 8
    paddingHorizontal: 4, // increased from 2
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4, // increased from 2
  },
  macroItem: {
    flexDirection: "row", // Side by side
    alignItems: "center",
    gap: 6,
  },
  // macroHeader removed
  dot: {
    width: 6, // increased from 4
    height: 6, // increased from 4
    borderRadius: 3,
  },
  macroLabel: {
    fontFamily: "Inter",
    fontSize: 12, // increased from 11
    fontWeight: "400",
    color: "#6B7280",
  },
  macroValue: {
    fontFamily: "Inter",
    fontSize: 12, // increased from 11
    marginLeft: -2,
  },
  macroCurrent: {
    fontWeight: "600",
    color: "#111827",
  },
  macroGoal: {
    fontWeight: "400",
    color: "#9CA3AF",
  },
});
