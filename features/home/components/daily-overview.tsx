import { Colors, getThemeColors } from "@/constants/theme";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
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
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[600];

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

  const roundedCalories = Math.round(totalCalories);

  return (
    <View style={[
      styles.card,
      { 
        backgroundColor: themeColors.background.surface,
        borderColor: isDark ? themeColors.border.light : Colors.lilac[200],
      }
    ]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? themeColors.border.light : Colors.lilac[200] }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="flash" size={16} color={accentColor} />
        </View>
        <Text style={[styles.headerTitle, { color: themeColors.text.secondary }]}>Daily Overview</Text>
      </View>

      <View style={styles.divider} />

      {/* Calories */}
      <View style={styles.calorieContainer}>
        <Text style={[styles.currentCalories, { color: themeColors.text.primary }]}>{roundedCalories}</Text>
        <Text style={[styles.goalCalories, { color: themeColors.text.tertiary }]}>/{goalCalories} cal goal</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarWrapper}>
        <CalorieProgressBar
          currentValue={totalCalories}
          goalValue={goalCalories}
          filledColor={isDark ? ["#BF5AF2", "#9D4EDD"] : ["#A78BFA", "#7C3AED"]}
          height={10}
        />
      </View>

      {/* Macros */}
      <View style={styles.macrosContainer}>
        <MacroItem
          label="Carbs"
          value={totalCarbs}
          goal={goalCarbs}
          color="#10B981"
          themeColors={themeColors}
        />
        <MacroItem
          label="Protein"
          value={totalProtein}
          goal={goalProtein}
          color="#F59E0B"
          themeColors={themeColors}
        />
        <MacroItem
          label="Fat"
          value={totalFat}
          goal={goalFat}
          color="#EF4444"
          themeColors={themeColors}
        />
      </View>
    </View>
  );
}

type ThemeColorsType = ReturnType<typeof getThemeColors>;

function MacroItem({
  label,
  value,
  goal,
  color,
  themeColors,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
  themeColors: ThemeColorsType;
}) {
  return (
    <View style={styles.macroItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.macroLabel, { color: themeColors.text.tertiary }]}>{label}</Text>
      <Text style={styles.macroValue}>
        <Text style={[styles.macroCurrent, { color: themeColors.text.primary }]}>{Math.round(value)}</Text>
        <Text style={[styles.macroGoal, { color: themeColors.text.tertiary }]}>/{goal}g</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderRadius: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 16,
    width: 16,
  },
  headerTitle: {
    fontFamily: "Inter",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
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
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  currentCalories: {
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: "700",
  },
  goalCalories: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
  },
  progressBarWrapper: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroLabel: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
  },
  macroValue: {
    fontFamily: "Inter",
    fontSize: 12,
    marginLeft: -2,
  },
  macroCurrent: {
    fontWeight: "600",
  },
  macroGoal: {
    fontWeight: "400",
  },
});

