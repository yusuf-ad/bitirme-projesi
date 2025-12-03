import { Colors } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

// Types
export type MealTypeOption =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snacks"
  | "surprise";
export type CookingTimeOption = "<15" | "15-29" | "30-60" | "open";
export type CalorieRangeOption =
  | "<200"
  | "200-399"
  | "400-599"
  | "600-1000"
  | "1000+"
  | "flexible";

export interface ChipOption<T> {
  id: T;
  label: string;
  emoji: string;
}

// Chip Options Data
export const MEAL_TYPE_OPTIONS: ChipOption<MealTypeOption>[] = [
  { id: "breakfast", label: "Breakfast", emoji: "🔍" },
  { id: "lunch", label: "Lunch", emoji: "🥗" },
  { id: "dinner", label: "Dinner", emoji: "🍲" },
  { id: "snacks", label: "Snacks", emoji: "🧀" },
  { id: "surprise", label: "Surprise Me", emoji: "👀" },
];

export const COOKING_TIME_OPTIONS: ChipOption<CookingTimeOption>[] = [
  { id: "<15", label: "<15 min", emoji: "🥪" },
  { id: "15-29", label: "15-29 min", emoji: "🥗" },
  { id: "30-60", label: "30-60 min", emoji: "🍳" },
  { id: "open", label: "Open to All", emoji: "➕" },
];

export const CALORIE_RANGE_OPTIONS: ChipOption<CalorieRangeOption>[] = [
  { id: "<200", label: "<200", emoji: "🔥" },
  { id: "200-399", label: "200-399", emoji: "🔥" },
  { id: "400-599", label: "400-599", emoji: "🔥" },
  { id: "600-1000", label: "600-1000", emoji: "🔥" },
  { id: "1000+", label: "1000+", emoji: "💧" },
  { id: "flexible", label: "Flexible", emoji: "➕" },
];

// Chip Component
export function SelectableChip<T extends string>({
  option,
  isSelected,
  onPress,
}: {
  option: ChipOption<T>;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={styles.chipEmoji}>{option.emoji}</Text>
      <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
        {option.label}
      </Text>
    </Pressable>
  );
}

// Info Chip Component (readonly for showing user preferences)
export function InfoChip({ label }: { label: string }) {
  return (
    <View style={styles.infoChip}>
      <Text style={styles.infoChipLabel}>{label}</Text>
    </View>
  );
}

// Chip Section Component
interface ChipSectionProps<T extends string> {
  title: string;
  options: ChipOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

export function ChipSection<T extends string>({
  title,
  options,
  selectedValue,
  onSelect,
}: ChipSectionProps<T>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipsContainer}>
        {options.map((option) => (
          <SelectableChip
            key={option.id}
            option={option}
            isSelected={selectedValue === option.id}
            onPress={() => onSelect(option.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.background.surface,
  },
  chipSelected: {
    backgroundColor: Colors.green[100],
    borderColor: Colors.green[600],
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  chipLabelSelected: {
    color: Colors.green[900],
  },
  infoChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: Colors.lilac[100],
    borderWidth: 1,
    borderColor: Colors.lilac[300],
  },
  infoChipLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.lilac[900],
  },
});
