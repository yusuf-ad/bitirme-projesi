import { getThemeColors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { DIET_OPTIONS, DietOption } from "./diet-options";

interface DietDetailScreenProps {
  dietId?: string;
}

const MACRO_COLORS = {
  protein: "#8EC78D",
  fat: "#F5A26F",
  carbohydrates: "#95A0F3",
};

const MACRO_CALORIES = {
  protein: 4,
  carbohydrates: 4,
  fat: 9,
};

export function DietDetailScreen({ dietId }: DietDetailScreenProps) {
  const router = useRouter();
  const { selection } = useHaptics();
  const insets = useSafeAreaInsets();
  const onboarding = useOnboarding();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);

  const dietOption: DietOption | undefined = DIET_OPTIONS.find(
    (diet) => diet.id === dietId
  );

  const savedTarget = dietOption
    ? onboarding.dietNutritionTargets[dietOption.id]
    : undefined;

  // Determine target values: saved user override OR default options
  const targetSource = savedTarget || {
    calories: dietOption?.targetCalories ?? 2200,
    protein: dietOption?.defaultMacros.protein ?? 0.25,
    fat: dietOption?.defaultMacros.fat ?? 0.3,
    carbs: dietOption?.defaultMacros.carbohydrates ?? 0.45,
  };

  const macroBreakdown = useMemo(() => {
    if (!dietOption) return null;

    let calories = 0;
    let pGrams = 0;
    let fGrams = 0;
    let cGrams = 0;

    if (savedTarget) {
      // Case 1: Custom saved targets (in grams)
      pGrams = savedTarget.protein;
      fGrams = savedTarget.fat;
      cGrams = savedTarget.carbs;
      calories = savedTarget.calories;
    } else {
      // Case 2: Defaults (percentages -> grams)
      const tCals = dietOption.targetCalories;
      const ratios = dietOption.defaultMacros;
      
      pGrams = Math.round((tCals * ratios.protein) / MACRO_CALORIES.protein);
      fGrams = Math.round((tCals * ratios.fat) / MACRO_CALORIES.fat);
      cGrams = Math.round((tCals * ratios.carbohydrates) / MACRO_CALORIES.carbohydrates);
      calories = tCals;
    }

    const macros = [
      {
        key: "protein" as const,
        label: "Protein",
        color: MACRO_COLORS.protein,
        grams: pGrams,
      },
      {
        key: "fat" as const,
        label: "Fat",
        color: MACRO_COLORS.fat,
        grams: fGrams,
      },
      {
        key: "carbohydrates" as const,
        label: "Carb",
        color: MACRO_COLORS.carbohydrates,
        grams: cGrams,
      },
    ];

    const totalGrams = pGrams + fGrams + cGrams;
    const macrosWithPercentages = macros.map((m) => ({
      ...m,
      percentage: totalGrams > 0 ? (m.grams / totalGrams) * 100 : 0,
    }));

    return { calories, macros: macrosWithPercentages };
  }, [dietOption, savedTarget]);

  const handleBack = async () => {
    selection();
    router.back();
  };

  const handleSelectDiet = async () => {
    if (!dietOption) {
      return;
    }

    selection();

    const alreadySelected = onboarding.selectedDietPreferences.includes(
      dietOption.id
    );
    if (!alreadySelected) {
      onboarding.setSelectedDietPreferences([
        ...onboarding.selectedDietPreferences,
        dietOption.id,
      ]);
    }
    router.back();
  };

  if (!dietOption) {
    return (
      <View style={[styles.fallbackContainer, { backgroundColor: Colors.background.primary }]}>
        <Text style={[styles.fallbackTitle, { color: Colors.text.primary }]}>Diet not found</Text>
        <Pressable style={[styles.fallbackButton, { backgroundColor: Colors.lilac[900] }]} onPress={handleBack}>
          <Text style={styles.fallbackButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const isDietSelected = onboarding.selectedDietPreferences.includes(
    dietOption.id
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: Colors.background.secondary }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dragHandle} />
        <Text style={[styles.title, { color: Colors.text.primary }]}>{dietOption.label} Diet</Text>

        <View style={[styles.chartCard, { backgroundColor: Colors.background.surface, shadowColor: Colors.card.shadow }]}>
          {macroBreakdown ? (
            <>
              <CalorieDonut
                calories={macroBreakdown.calories}
                macros={macroBreakdown.macros}
                isDark={isDark}
                Colors={Colors}
              />
              <View style={styles.legendContainer}>
                {macroBreakdown.macros.map((macro) => (
                  <View key={macro.key} style={styles.legendRow}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: macro.color },
                      ]}
                    />
                    <Text style={[styles.legendLabel, { color: Colors.text.primary }]}>
                      {macro.percentage.toFixed(0)}% {macro.label}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorTitle, { color: Colors.text.primary }]}>No data</Text>
              <Text style={[styles.errorSubtitle, { color: Colors.text.secondary }]}>
                We could not calculate the macro targets right now.
              </Text>
            </View>
          )}
        </View>

        <Pressable
          style={[
              styles.adjustButton, 
              { backgroundColor: isDark ? "rgba(120, 73, 182, 0.2)" : "#EEF2FF" }
          ]}
          onPress={async () => {
            selection();
            router.push({
              pathname: "/(onboarding)/diet/adjust",
              params: { dietId: dietOption.id },
            });
          }}
        >
          <Text style={[styles.adjustButtonText, { color: isDark ? Colors.accent.lilac : "#1E40AF" }]}>Adjust nutrition targets</Text>
        </Pressable>

        <Text style={[styles.description, { color: Colors.text.secondary }]}>{dietOption.detailDescription}</Text>

        {dietOption.sourceUrl && (
          <Pressable
            style={styles.sourceLink}
            onPress={() => Linking.openURL(dietOption.sourceUrl!)}
          >
            <Text style={[styles.sourceText, { color: Colors.text.accent }]}>Source of recommendations</Text>
          </Pressable>
        )}

        <Image source={dietOption.image} style={styles.heroImage} />
      </ScrollView>

      <View style={[
          styles.footer, 
          { 
              paddingBottom: insets.bottom + 12,
              backgroundColor: isDark ? "rgba(28, 28, 30, 0.9)" : "rgba(248, 250, 252, 0.9)",
              borderTopColor: Colors.border.light,
              borderTopWidth: 1
          }
      ]}>
        <Pressable style={[styles.backButton, { backgroundColor: Colors.background.surface, borderColor: Colors.border.light }]} onPress={handleBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={Colors.text.primary}
          />
        </Pressable>

        <Pressable
          style={[
            styles.selectButton,
            { backgroundColor: Colors.lilac[900] },
            isDietSelected && { backgroundColor: Colors.gray[400] },
          ]}
          onPress={handleSelectDiet}
          disabled={isDietSelected}
        >
          <Text style={styles.selectButtonText}>
            {isDietSelected ? "Selected" : "Select"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

interface CalorieDonutProps {
  calories: number;
  macros: {
    key: "protein" | "fat" | "carbohydrates";
    label: string;
    percentage: number;
    color: string;
  }[];
  isDark: boolean;
  Colors: any;
}

function CalorieDonut({ calories, macros, isDark, Colors }: CalorieDonutProps) {
  const radius = 70;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <View style={styles.chartWrapper}>
      <Svg width={radius * 2} height={radius * 2}>
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          stroke={isDark ? Colors.background.tertiary : "#F1F5F9"}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {macros.map((segment) => {
          const dash = (segment.percentage / 100) * circumference;
          const offset = circumference * (1 - cumulative / 100);
          cumulative += segment.percentage;

          return (
            <Circle
              key={segment.key}
              cx={radius}
              cy={radius}
              r={radius - strokeWidth / 2}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>

      <View style={styles.chartCenter}>
        <Text style={[styles.calorieValue, { color: Colors.text.primary }]}>
          {Math.round(calories)}{" "}
          <Text style={[styles.calorieUnit, { color: Colors.text.secondary }]}>kcal/day</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 160,
    paddingTop: 8,
  },
  dragHandle: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 28,
    color: "#1F2933",
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 20,
  },
  chartWrapper: {
    position: "relative",
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  chartCenter: {
    position: "absolute",
    alignItems: "center",
  },
  calorieValue: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 20,
    textAlign: "center",
  },
  calorieUnit: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
  },
  legendContainer: {
    flex: 1,
    gap: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "500",
  },
  adjustButton: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 20,
  },
  adjustButtonText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    color: "#1E40AF",
  },
  description: {
    fontFamily: "Inter",
    fontSize: 16,
    lineHeight: 22,
    color: "#4B5563",
    marginBottom: 12,
  },
  sourceLink: {
    marginBottom: 28,
  },
  sourceText: {
    fontFamily: "Inter",
    fontSize: 15,
    textDecorationLine: "underline",
    color: "#1D4ED8",
  },
  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    resizeMode: "cover",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 16,
    backgroundColor: "rgba(248, 250, 252, 0.9)",
  },
  backButton: {
    width: 64,
    height: 52,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  selectButton: {
    flex: 1,
    height: 52,
    borderRadius: 28,
    backgroundColor: "#1F2933",
    alignItems: "center",
    justifyContent: "center",
  },
  selectButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  selectButtonText: {
    fontFamily: "Inter",
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  fallbackTitle: {
    fontFamily: "Inter",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  fallbackButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  fallbackButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  errorTitle: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    color: "#111827",
  },
  errorSubtitle: {
    fontFamily: "Inter",
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  retryBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F3E8FF",
    marginBottom: 20,
  },
  retryText: {
    fontFamily: "Inter",
    fontWeight: "600",
    color: "#6D28D9",
  },
});

