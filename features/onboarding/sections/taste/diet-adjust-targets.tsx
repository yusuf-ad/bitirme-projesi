import { getThemeColors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DIET_OPTIONS } from "./diet-options";

interface DietAdjustTargetsProps {
  dietId?: string;
  nextSection?: string;
  nextStep?: string;
}

interface MacroRowProps {
  label: string;
  value: number;
  kcal: number;
  onChange: (next: number) => void;
  isDark: boolean;
  Colors: any;
}

const MACRO_STEP = 5;

export function DietAdjustTargetsScreen({
  dietId,
  nextSection,
  nextStep,
}: DietAdjustTargetsProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selection } = useHaptics();
  const onboarding = useOnboarding();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);

  const diet = useMemo(
    () => DIET_OPTIONS.find((option) => option.id === dietId),
    [dietId]
  );
  const savedTarget = dietId
    ? onboarding.dietNutritionTargets[dietId]
    : undefined;

  // Calculate percentages helper
  const calculatePct = (grams: number, multiplier: number, totalCals: number) => {
    if (!totalCals) return 0;
    return Math.round(((grams * multiplier) / totalCals) * 100);
  };

  // Calculate target calories based on user's body metrics and goals
  // Using Mifflin-St Jeor formula for BMR
  const targetCalories = useMemo(() => {
    const { weight, height, age, selectedGender, selectedGoals } = onboarding;

    // If we don't have enough data, fall back to diet default or 2200
    if (!weight || !height || !age) {
      return diet?.targetCalories ?? 2200;
    }

    // Calculate BMR using Mifflin-St Jeor formula
    let bmr: number;
    if (selectedGender === 'female') {
      // Women: 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      // Men (default): 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    }

    // Apply activity multiplier (moderate activity = 1.55)
    // TODO: Add activity level selection in onboarding for more accuracy
    const activityMultiplier = 1.55;
    let tdee = Math.round(bmr * activityMultiplier);

    // Adjust based on goals
    if (selectedGoals.includes('lose-weight')) {
      // Calorie deficit for weight loss (-500 kcal/day ≈ 0.5 kg/week)
      tdee -= 500;
    } else if (selectedGoals.includes('gain-weight') || selectedGoals.includes('build-muscle')) {
      // Calorie surplus for weight/muscle gain (+300 kcal/day)
      tdee += 300;
    }

    // Ensure minimum healthy calorie intake
    const minCalories = selectedGender === 'female' ? 1200 : 1500;
    return Math.max(tdee, minCalories);
  }, [onboarding.weight, onboarding.height, onboarding.age, onboarding.selectedGender, onboarding.selectedGoals, diet]);

  // Initialize state with percentages
  const [proteinPct, setProteinPct] = useState(() => {
    if (savedTarget?.protein && savedTarget.calories) {
      return calculatePct(savedTarget.protein, 4, savedTarget.calories);
    }
    return Math.round((diet?.defaultMacros.protein ?? 0.3) * 100);
  });

  const [fatPct, setFatPct] = useState(() => {
    if (savedTarget?.fat && savedTarget.calories) {
      return calculatePct(savedTarget.fat, 9, savedTarget.calories);
    }
    return Math.round((diet?.defaultMacros.fat ?? 0.3) * 100);
  });

  const [carbPct, setCarbPct] = useState(() => {
    if (savedTarget?.carbs && savedTarget.calories) {
      return calculatePct(savedTarget.carbs, 4, savedTarget.calories);
    }
    return Math.round((diet?.defaultMacros.carbohydrates ?? 0.4) * 100);
  });

  // Re-sync if dietId changes or savedTarget exists
  useEffect(() => {
    if (!diet) return;
    if (savedTarget) {
      const cals = savedTarget.calories || diet.targetCalories;
      setProteinPct(calculatePct(savedTarget.protein, 4, cals));
      setFatPct(calculatePct(savedTarget.fat, 9, cals));
      setCarbPct(calculatePct(savedTarget.carbs, 4, cals));
    } else {
      setProteinPct(Math.round(diet.defaultMacros.protein * 100));
      setFatPct(Math.round(diet.defaultMacros.fat * 100));
      setCarbPct(Math.round(diet.defaultMacros.carbohydrates * 100));
    }
  }, [dietId, savedTarget, diet]);

  const totalPct = proteinPct + fatPct + carbPct;
  const isValid = totalPct === 100;

  const handleMacroChange = (
    setter: (value: number) => void,
    nextValue: number
  ) => {
    const clamped = Math.max(0, Math.min(100, nextValue));
    setter(clamped);
  };

  const handleSave = async (useDefaults = false) => {
    if (!diet || !dietId) return;

    selection();

    let payload;
    const cals = diet.targetCalories;

    if (useDefaults) {
      payload = {
        calories: cals,
        protein: Math.round((cals * diet.defaultMacros.protein) / 4),
        fat: Math.round((cals * diet.defaultMacros.fat) / 9),
        carbs: Math.round((cals * diet.defaultMacros.carbohydrates) / 4),
      };
    } else {
      payload = {
        calories: cals,
        protein: Math.round((cals * (proteinPct / 100)) / 4),
        fat: Math.round((cals * (fatPct / 100)) / 9),
        carbs: Math.round((cals * (carbPct / 100)) / 4),
      };
    }

    await onboarding.saveDietNutritionTarget(diet.id, payload);

    if (nextSection && nextStep) {
      router.replace({
        pathname: "/(onboarding)/flow",
        params: { section: nextSection, step: nextStep },
      });
      return;
    }

    router.back();
  };

  const handleUseDefaults = async () => {
    if (!diet) return;
    setProteinPct(Math.round(diet.defaultMacros.protein * 100));
    setFatPct(Math.round(diet.defaultMacros.fat * 100));
    setCarbPct(Math.round(diet.defaultMacros.carbohydrates * 100));
    await handleSave(true);
  };

  if (!diet) {
    return (
      <View style={[styles.fallbackContainer, { backgroundColor: Colors.background.primary }]}>
        <Text style={[styles.fallbackTitle, { color: Colors.text.primary }]}>Diet not found</Text>
        <Pressable style={[styles.fallbackButton, { backgroundColor: Colors.lilac[900] }]} onPress={() => router.back()}>
          <Text style={styles.fallbackButtonText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[
      styles.screen,
      {
        paddingTop: insets.top + 12,
        backgroundColor: Colors.background.secondary
      }
    ]}>
      <Text style={[styles.title, { color: Colors.text.primary }]}>Adjust targets</Text>
      <Text style={[styles.subtitle, { color: Colors.text.secondary }]}>
        Adjust your daily macro distribution (%)
      </Text>

      {/* Target and Total Display */}
      <View style={[styles.card, { backgroundColor: Colors.background.surface, shadowColor: Colors.card.shadow }]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardLabel, { color: Colors.accent.lilac }]}>Target Calories</Text>
          <Text style={[styles.cardValue, { color: Colors.text.primary }]}>
            {targetCalories} <Text style={[styles.unit, { color: Colors.text.secondary }]}>kcal</Text>
          </Text>
        </View>
        <View style={[styles.rowBetween, { marginTop: 12 }]}>
          <Text style={[styles.cardLabel, { color: Colors.text.primary }]}>Total Allocation</Text>
          <Text style={[styles.cardValue, { color: Colors.text.primary }, !isValid && { color: Colors.semantic.error.main }]}>
            {totalPct}%
          </Text>
        </View>
        {!isValid && (
          <Text style={[styles.validationMsg, { color: Colors.semantic.error.main }]}>
            Total must equal 100% (currently {totalPct}%)
          </Text>
        )}
      </View>

      <View style={styles.macrosContainer}>
        <MacroRow
          label="Protein (%)"
          value={proteinPct}
          kcal={Math.round(targetCalories * (proteinPct / 100))}
          onChange={(next) => handleMacroChange(setProteinPct, next)}
          isDark={isDark}
          Colors={Colors}
        />
        <MacroRow
          label="Fat (%)"
          value={fatPct}
          kcal={Math.round(targetCalories * (fatPct / 100))}
          onChange={(next) => handleMacroChange(setFatPct, next)}
          isDark={isDark}
          Colors={Colors}
        />
        <MacroRow
          label="Carbohydrates (%)"
          value={carbPct}
          kcal={Math.round(targetCalories * (carbPct / 100))}
          onChange={(next) => handleMacroChange(setCarbPct, next)}
          isDark={isDark}
          Colors={Colors}
        />
      </View>

      <Pressable
        style={[
          styles.primaryButton,
          { backgroundColor: Colors.lilac[900] },
          !isValid && { backgroundColor: isDark ? Colors.gray[700] : Colors.gray[300], opacity: 0.5 }
        ]}
        onPress={() => isValid && handleSave()}
        disabled={!isValid}
      >
        <Text style={styles.primaryButtonText}>Save</Text>
      </Pressable>

      <Pressable
        style={[
          styles.secondaryButton,
          { backgroundColor: isDark ? Colors.background.tertiary : "#E5E7EB" }
        ]}
        onPress={handleUseDefaults}
      >
        <Text style={[styles.secondaryButtonText, { color: Colors.text.primary }]}>Use defaults</Text>
      </Pressable>

      <View style={{ height: insets.bottom + 24 }} />
    </View>
  );
}

function MacroRow({ label, value, kcal, onChange, isDark, Colors }: MacroRowProps) {
  const { selection } = useHaptics();
  const handlePress = async (next: number) => {
    selection();
    onChange(next);
  };

  return (
    <View style={[styles.macroRow, { backgroundColor: Colors.background.surface }]}>
      <Pressable
        onPress={() => handlePress(value - MACRO_STEP)}
        style={[styles.macroControl, { borderColor: Colors.border.light, backgroundColor: isDark ? Colors.background.tertiary : "transparent" }]}
        hitSlop={8}
      >
        <MaterialCommunityIcons name="minus" size={18} color={Colors.text.secondary} />
      </Pressable>
      <View style={styles.macroMiddle}>
        <Text style={[styles.macroLabel, { color: Colors.text.primary }]}>{label}</Text>
        <Text style={[styles.macroValue, { color: Colors.text.secondary }]}>{value}% • {kcal} kcal</Text>
      </View>
      <Pressable
        onPress={() => handlePress(value + MACRO_STEP)}
        style={[styles.macroControl, { borderColor: Colors.border.light, backgroundColor: isDark ? Colors.background.tertiary : "transparent" }]}
        hitSlop={8}
      >
        <MaterialCommunityIcons name="plus" size={18} color={Colors.text.secondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#F7F8FB", // default/fallback
  },
  title: {
    fontFamily: "Inter",
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontFamily: "Inter",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardLabel: {
    fontFamily: "Inter",
    fontSize: 16,
    marginBottom: 0,
    fontWeight: "600",
  },
  macrosContainer: {
    gap: 12,
    marginBottom: 20,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  macroControl: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  macroMiddle: {
    flex: 1,
    alignItems: "center",
  },
  macroLabel: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "600",
  },
  macroValue: {
    fontFamily: "Inter",
    fontSize: 14,
    marginTop: 4,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    fontFamily: "Inter",
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "600",
  },
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  fallbackTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  fallbackButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  fallbackButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardValue: {
    fontFamily: "Inter",
    fontSize: 20,
    fontWeight: "700",
  },
  unit: {
    fontSize: 14,
    fontWeight: "500",
  },
  validationMsg: {
    fontFamily: "Inter",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
});

