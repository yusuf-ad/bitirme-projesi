import { useOnboarding } from "@/providers/onboarding-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { useDietSummary } from "../../hooks/use-diet-summary";
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
  const insets = useSafeAreaInsets();
  const onboarding = useOnboarding();

  const dietOption: DietOption | undefined = DIET_OPTIONS.find(
    (diet) => diet.id === dietId
  );

  const savedTarget = dietOption
    ? onboarding.dietNutritionTargets[dietOption.id]
    : undefined;

  const { data, isLoading, isError, refetch } = useDietSummary({
    spoonacularDiet: dietOption?.spoonacularDiet,
    targetCalories: savedTarget?.calories ?? dietOption?.targetCalories,
    enabled: Boolean(dietOption),
  });

  const macroBreakdown = useMemo(() => {
    if (!dietOption) {
      return null;
    }

    // If user has saved targets (grams), use them directly
    if (savedTarget) {
      const { calories, protein, fat, carbs } = savedTarget;
      
      const macros = [
        {
          key: "protein" as const,
          label: "Protein",
          color: MACRO_COLORS.protein,
          grams: protein,
        },
        {
          key: "fat" as const,
          label: "Fat",
          color: MACRO_COLORS.fat,
          grams: fat,
        },
        {
          key: "carbohydrates" as const,
          label: "Carb",
          color: MACRO_COLORS.carbohydrates,
          grams: carbs,
        },
      ];

      // Calculate percentages for the donut chart
      const totalGrams = protein + fat + carbs;
      const macrosWithPercentages = macros.map(m => ({
        ...m,
        percentage: totalGrams > 0 ? (m.grams / totalGrams) * 100 : 0
      }));

      return { calories, macros: macrosWithPercentages };
    }

    // Fallback: Calculate grams from default percentages
    const targetCalories = dietOption.targetCalories;
    const fallbackRatios = dietOption.defaultMacros;

    const fallbackGrams = {
      protein: Math.round((targetCalories * fallbackRatios.protein) / MACRO_CALORIES.protein),
      fat: Math.round((targetCalories * fallbackRatios.fat) / MACRO_CALORIES.fat),
      carbohydrates: Math.round((targetCalories * fallbackRatios.carbohydrates) / MACRO_CALORIES.carbohydrates),
    };

    // Use API data if available, otherwise fallback grams
    const macros = [
      {
        key: "protein" as const,
        label: "Protein",
        grams: data?.protein ?? fallbackGrams.protein,
        color: MACRO_COLORS.protein,
      },
      {
        key: "fat" as const,
        label: "Fat",
        grams: data?.fat ?? fallbackGrams.fat,
        color: MACRO_COLORS.fat,
      },
      {
        key: "carbohydrates" as const,
        label: "Carb",
        grams: data?.carbohydrates ?? fallbackGrams.carbohydrates,
        color: MACRO_COLORS.carbohydrates,
      },
    ];

    const totalGrams = macros.reduce((sum, m) => sum + m.grams, 0);
    const macrosWithPercentages = macros.map(m => ({
      ...m,
      percentage: totalGrams > 0 ? (m.grams / totalGrams) * 100 : 0
    }));

    const totalCalories =
      data?.calories ??
      macros.reduce(
        (sum, macro) => sum + macro.grams * MACRO_CALORIES[macro.key],
        0
      );

    return {
      calories: totalCalories,
      macros: macrosWithPercentages,
    };
  }, [data, dietOption, savedTarget]);

  const handleBack = async () => {
    await Haptics.selectionAsync();
    router.back();
  };

  const handleSelectDiet = async () => {
    if (!dietOption) {
      return;
    }

    await Haptics.selectionAsync();

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
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackTitle}>Diet not found</Text>
        <Pressable style={styles.fallbackButton} onPress={handleBack}>
          <Text style={styles.fallbackButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const isDietSelected = onboarding.selectedDietPreferences.includes(
    dietOption.id
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dragHandle} />
        <Text style={styles.title}>{dietOption.label} Diet</Text>

        <View style={styles.chartCard}>
          {macroBreakdown ? (
            <>
              <CalorieDonut
                calories={macroBreakdown.calories}
                macros={macroBreakdown.macros}
                isLoading={isLoading}
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
                    <Text style={styles.legendLabel}>
                      {macro.percentage.toFixed(0)}% {macro.label}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>No data</Text>
              <Text style={styles.errorSubtitle}>
                We could not calculate the macro targets right now.
              </Text>
            </View>
          )}
        </View>

        {isError && (
          <Pressable
            style={styles.retryBanner}
            onPress={async () => {
              await Haptics.selectionAsync();
              refetch();
            }}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={18}
              color="#8B5CF6"
            />
            <Text style={styles.retryText}>Retry Spoonacular request</Text>
          </Pressable>
        )}

        <Pressable
          style={styles.adjustButton}
          onPress={async () => {
            await Haptics.selectionAsync();
            router.push({
              pathname: "/(onboarding)/diet/adjust",
              params: { dietId: dietOption.id },
            });
          }}
        >
          <Text style={styles.adjustButtonText}>Adjust nutrition targets</Text>
        </Pressable>

        <Text style={styles.description}>{dietOption.detailDescription}</Text>

        {dietOption.sourceUrl && (
          <Pressable
            style={styles.sourceLink}
            onPress={() => Linking.openURL(dietOption.sourceUrl!)}
          >
            <Text style={styles.sourceText}>Source of recommendations</Text>
          </Pressable>
        )}

        <Image source={dietOption.image} style={styles.heroImage} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color="#1F2933"
          />
        </Pressable>

        <Pressable
          style={[
            styles.selectButton,
            isDietSelected && styles.selectButtonDisabled,
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
  isLoading: boolean;
}

function CalorieDonut({ calories, macros, isLoading }: CalorieDonutProps) {
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
          stroke="#F1F5F9"
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
        {isLoading ? (
          <ActivityIndicator color="#111827" />
        ) : (
          <>
            <Text style={styles.calorieValue}>
              {Math.round(calories)}{" "}
              <Text style={styles.calorieUnit}>kcal/day</Text>
            </Text>
          </>
        )}
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
    shadowColor: "#0F172A",
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
    color: "#111827",
    textAlign: "center",
  },
  calorieUnit: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    color: "#6B7280",
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
    color: "#1F2933",
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

