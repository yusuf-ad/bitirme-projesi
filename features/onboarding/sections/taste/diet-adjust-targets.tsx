import { useOnboarding } from "@/providers/onboarding-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
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

const MACRO_STEP = 1;

export function DietAdjustTargetsScreen({
  dietId,
  nextSection,
  nextStep,
}: DietAdjustTargetsProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const onboarding = useOnboarding();

  const diet = useMemo(
    () => DIET_OPTIONS.find((option) => option.id === dietId),
    [dietId]
  );
  const savedTarget = dietId
    ? onboarding.dietNutritionTargets[dietId]
    : undefined;

  // Initialize state with saved values or calculated defaults (grams)
  const [protein, setProtein] = useState(() => {
    if (savedTarget?.protein) return savedTarget.protein;
    const cals = diet?.targetCalories ?? 2200;
    const percent = diet?.defaultMacros.protein ?? 0.3;
    return Math.round((cals * percent) / 4);
  });

  const [fat, setFat] = useState(() => {
    if (savedTarget?.fat) return savedTarget.fat;
    const cals = diet?.targetCalories ?? 2200;
    const percent = diet?.defaultMacros.fat ?? 0.3;
    return Math.round((cals * percent) / 9);
  });

  const [carb, setCarb] = useState(() => {
    if (savedTarget?.carbs) return savedTarget.carbs;
    const cals = diet?.targetCalories ?? 2200;
    const percent = diet?.defaultMacros.carbohydrates ?? 0.4;
    return Math.round((cals * percent) / 4);
  });

  // Re-sync if dietId changes (though usually this screen is for one diet)
  useEffect(() => {
    if (!diet) return;
    if (savedTarget) {
      setProtein(savedTarget.protein);
      setFat(savedTarget.fat);
      setCarb(savedTarget.carbs);
    } else {
      const cals = diet.targetCalories;
      setProtein(Math.round((cals * diet.defaultMacros.protein) / 4));
      setFat(Math.round((cals * diet.defaultMacros.fat) / 9));
      setCarb(Math.round((cals * diet.defaultMacros.carbohydrates) / 4));
    }
  }, [dietId, savedTarget, diet]);

  // Calculate total calories from grams
  const calculatedCalories = Math.round(protein * 4 + fat * 9 + carb * 4);

  const handleMacroChange = (
    setter: (value: number) => void,
    nextValue: number
  ) => {
    // Cap at reasonable max (e.g. 1000g) to prevent overflow/UI issues
    const clamped = Math.max(0, Math.min(1000, nextValue));
    setter(clamped);
  };

  const handleSave = async (useDefaults = false) => {
    if (!diet || !dietId) return;

    await Haptics.selectionAsync();

    let payload;
    if (useDefaults) {
      const cals = diet.targetCalories;
      payload = {
        calories: cals,
        protein: Math.round((cals * diet.defaultMacros.protein) / 4),
        fat: Math.round((cals * diet.defaultMacros.fat) / 9),
        carbs: Math.round((cals * diet.defaultMacros.carbohydrates) / 4),
      };
    } else {
      payload = {
        calories: calculatedCalories,
        protein,
        fat,
        carbs: carb,
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
    const cals = diet.targetCalories;
    setProtein(Math.round((cals * diet.defaultMacros.protein) / 4));
    setFat(Math.round((cals * diet.defaultMacros.fat) / 9));
    setCarb(Math.round((cals * diet.defaultMacros.carbohydrates) / 4));
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
        What are your daily nutrition targets?
      </Text>

      {/* Calculated Calories Display */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Calculated Calories</Text>
        <Text style={styles.calorieDisplay}>
          {calculatedCalories} <Text style={styles.calorieUnit}>kcal</Text>
        </Text>
      </View>

      <View style={styles.macrosContainer}>
        <MacroRow
          label="Protein (g)"
          value={protein}
          onChange={(next) => handleMacroChange(setProtein, next)}
        />
        <MacroRow
          label="Fat (g)"
          value={fat}
          onChange={(next) => handleMacroChange(setFat, next)}
        />
        <MacroRow
          label="Carbohydrates (g)"
          value={carb}
          onChange={(next) => handleMacroChange(setCarb, next)}
        />
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => handleSave()}
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
  const handlePress = async (next: number) => {
    await Haptics.selectionAsync();
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
        <Text style={styles.macroValue}>{value}</Text>
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
    marginBottom: 12,
  },
  calorieDisplay: {
    fontFamily: "Inter",
    fontSize: 40,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },
  calorieUnit: {
    fontSize: 20,
    fontWeight: "500",
    color: "#6B7280",
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
  totalCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontFamily: "Inter",
    fontSize: 16,
    color: "#6B7280",
  },
  totalValue: {
    fontFamily: "Inter",
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  },
  totalError: {
    fontFamily: "Inter",
    fontSize: 13,
    color: "#DC2626",
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
});

