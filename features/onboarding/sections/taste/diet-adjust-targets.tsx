import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "@/providers/onboarding-provider";
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
  const [calorieInput, setCalorieInput] = useState(
    String(savedTarget?.calories ?? diet?.targetCalories ?? 2200)
  );
  const [protein, setProtein] = useState(
    savedTarget?.proteinPercent ??
      Math.round((diet?.defaultMacros.protein ?? 0.3) * 100)
  );
  const [fat, setFat] = useState(
    savedTarget?.fatPercent ??
      Math.round((diet?.defaultMacros.fat ?? 0.3) * 100)
  );
  const [carb, setCarb] = useState(
    savedTarget?.carbPercent ??
      Math.round((diet?.defaultMacros.carbohydrates ?? 0.4) * 100)
  );

  useEffect(() => {
    if (!diet) {
      return;
    }
    const nextCalories = savedTarget?.calories ?? diet.targetCalories ?? 2200;
    setCalorieInput(String(nextCalories));
    setProtein(
      savedTarget?.proteinPercent ??
        Math.round(diet.defaultMacros.protein * 100)
    );
    setFat(
      savedTarget?.fatPercent ?? Math.round(diet.defaultMacros.fat * 100)
    );
    setCarb(
      savedTarget?.carbPercent ??
        Math.round(diet.defaultMacros.carbohydrates * 100)
    );
  }, [dietId, savedTarget, diet]);

  const calories = Math.max(0, parseInt(calorieInput, 10) || 0);
  const total = protein + fat + carb;
  const isTotalValid = total === 100;

  const handleMacroChange = (
    setter: (value: number) => void,
    nextValue: number
  ) => {
    const clamped = Math.max(0, Math.min(100, nextValue));
    setter(clamped);
  };

  const handleSave = async (useDefaults = false) => {
    if (!diet || !dietId) {
      return;
    }

    if (!isTotalValid && !useDefaults) {
      return;
    }

    await Haptics.selectionAsync();

    const payload = useDefaults
      ? {
          calories: diet.targetCalories,
          proteinPercent: Math.round(diet.defaultMacros.protein * 100),
          fatPercent: Math.round(diet.defaultMacros.fat * 100),
          carbPercent: Math.round(diet.defaultMacros.carbohydrates * 100),
        }
      : {
          calories,
          proteinPercent: protein,
          fatPercent: fat,
          carbPercent: carb,
        };

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
    setCalorieInput(String(diet.targetCalories));
    setProtein(Math.round(diet.defaultMacros.protein * 100));
    setFat(Math.round(diet.defaultMacros.fat * 100));
    setCarb(Math.round(diet.defaultMacros.carbohydrates * 100));
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

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Calories per day</Text>
        <TextInput
          style={styles.calorieInput}
          keyboardType="number-pad"
          value={calorieInput}
          onChangeText={(text) => {
            const sanitized = text.replace(/\D/g, "");
            setCalorieInput(sanitized);
          }}
        />
      </View>

      <View style={styles.macrosContainer}>
        <MacroRow
          label="Protein"
          value={protein}
          onChange={(next) => handleMacroChange(setProtein, next)}
        />
        <MacroRow
          label="Fat"
          value={fat}
          onChange={(next) => handleMacroChange(setFat, next)}
        />
        <MacroRow
          label="Carbohydrates"
          value={carb}
          onChange={(next) => handleMacroChange(setCarb, next)}
        />
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total targets</Text>
        <Text style={styles.totalValue}>{total}%</Text>
        {!isTotalValid && (
          <Text style={styles.totalError}>
            The total amount must be exactly 100%
          </Text>
        )}
      </View>

      <Pressable
        style={[styles.primaryButton, !isTotalValid && styles.buttonDisabled]}
        onPress={() => handleSave()}
        disabled={!isTotalValid}
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
    marginBottom: 12,
  },
  calorieInput: {
    fontFamily: "Inter",
    fontSize: 40,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
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

