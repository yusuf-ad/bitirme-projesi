import { useHaptics } from "@/hooks/useHaptics";
import { useOnboarding } from "@/providers/onboarding-provider";
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
  onChange: (next: number) => void;
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

  const targetCalories = diet?.targetCalories ?? 2200;

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
    // We update UI but don't auto-save immediately to let user confirm, 
    // or we can just follow previous behavior. 
    // Previous behavior called handleSave(true) immediately. 
    // But since this is a "Use defaults" button that might just reset the sliders,
    // let's just reset sliders. If user wants to save they click save.
    // WAIT: Previous code was `await handleSave(true);` which exited the screen.
    // Let's keep that behavior for consistency.
    await handleSave(true);
  };

  if (!diet) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackTitle}>Diet not found</Text>
        <Pressable style={styles.fallbackButton} onPress={() => router.back()}>
          <Text style={styles.fallbackButtonText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.title}>Adjust targets</Text>
      <Text style={styles.subtitle}>
        Adjust your daily macro distribution (%)
      </Text>

      {/* Target and Total Display */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardLabel}>Target Calories</Text>
          <Text style={styles.cardValue}>
            {targetCalories} <Text style={styles.unit}>kcal</Text>
          </Text>
        </View>
        <View style={[styles.rowBetween, { marginTop: 12 }]}>
          <Text style={styles.cardLabel}>Total Allocation</Text>
          <Text style={[styles.cardValue, !isValid && styles.errorText]}>
            {totalPct}%
          </Text>
        </View>
        {!isValid && (
          <Text style={styles.validationMsg}>
            Total must equal 100% (currently {totalPct}%)
          </Text>
        )}
      </View>

      <View style={styles.macrosContainer}>
        <MacroRow
          label="Protein (%)"
          value={proteinPct}
          onChange={(next) => handleMacroChange(setProteinPct, next)}
        />
        <MacroRow
          label="Fat (%)"
          value={fatPct}
          onChange={(next) => handleMacroChange(setFatPct, next)}
        />
        <MacroRow
          label="Carbohydrates (%)"
          value={carbPct}
          onChange={(next) => handleMacroChange(setCarbPct, next)}
        />
      </View>

      <Pressable
        style={[styles.primaryButton, !isValid && styles.buttonDisabled]}
        onPress={() => isValid && handleSave()}
        disabled={!isValid}
      >
        <Text style={styles.primaryButtonText}>Save</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={handleUseDefaults}>
        <Text style={styles.secondaryButtonText}>Use defaults</Text>
      </Pressable>

      <View style={{ height: insets.bottom + 24 }} />
    </View>
  );
}

function MacroRow({ label, value, onChange }: MacroRowProps) {
  const { selection } = useHaptics();
  const handlePress = async (next: number) => {
    selection();
    onChange(next);
  };

  return (
    <View style={styles.macroRow}>
      <Pressable
        onPress={() => handlePress(value - MACRO_STEP)}
        style={styles.macroControl}
        hitSlop={8}
      >
        <MaterialCommunityIcons name="minus" size={18} color="#6B7280" />
      </Pressable>
      <View style={styles.macroMiddle}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{value}%</Text>
      </View>
      <Pressable
        onPress={() => handlePress(value + MACRO_STEP)}
        style={styles.macroControl}
        hitSlop={8}
      >
        <MaterialCommunityIcons name="plus" size={18} color="#6B7280" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#F7F8FB",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  cardLabel: {
    fontFamily: "Inter",
    fontSize: 16,
    color: "#6366F1",
    marginBottom: 0,
  },
  macrosContainer: {
    gap: 12,
    marginBottom: 20,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  macroControl: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#111827",
  },
  macroValue: {
    fontFamily: "Inter",
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
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
    backgroundColor: "#E5E7EB",
  },
  secondaryButtonText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F7F8FB",
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
    backgroundColor: "#111827",
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
    color: "#111827",
  },
  unit: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  errorText: {
    color: "#DC2626",
  },
  validationMsg: {
    fontFamily: "Inter",
    fontSize: 13,
    color: "#DC2626",
    marginTop: 8,
    textAlign: "center",
  },
});

