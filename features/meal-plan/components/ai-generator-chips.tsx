import { Colors, getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import CustomButton from "@/shared/components/custom-button";
import { StyleSheet, Text, View } from "react-native";

// Types
export type MealTypeOption = "breakfast" | "lunch" | "dinner" | "surprise";
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
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);

  return (
    <CustomButton
      containerStyle={[
        styles.chip,
        {
          backgroundColor: isSelected
            ? isDark
              ? "rgba(76, 175, 80, 0.2)"
              : Colors.green[100]
            : isDark
            ? themeColors.background.surface
            : Colors.background.surface,
          borderColor: isSelected
            ? isDark
              ? Colors.green[400]
              : Colors.green[600]
            : isDark
            ? themeColors.border.light
            : Colors.gray[200],
        },
      ]}
      onPress={onPress}
    >
      <Text style={styles.chipEmoji}>{option.emoji}</Text>
      <Text
        style={[
          styles.chipLabel,
          {
            color: isSelected
              ? isDark
                ? Colors.green[300]
                : Colors.green[900]
              : themeColors.text.primary,
          },
        ]}
      >
        {option.label}
      </Text>
    </CustomButton>
  );
}

// Info Chip Component (readonly for showing user preferences)
export function InfoChip({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "negative";
}) {
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);

  return (
    <View
      style={[
        styles.infoChip,
        variant === "negative"
          ? {
              backgroundColor: isDark
                ? "rgba(220, 38, 38, 0.15)"
                : Colors.semantic.error.light,
              borderColor: isDark
                ? Colors.semantic.error.main
                : Colors.semantic.error.main,
            }
          : {
              backgroundColor: isDark
                ? "rgba(191, 90, 242, 0.15)"
                : Colors.lilac[100],
              borderColor: isDark
                ? themeColors.accent.lilac
                : Colors.lilac[300],
            },
      ]}
    >
      <Text
        style={[
          styles.infoChipLabel,
          variant === "negative"
            ? {
                color: isDark
                  ? Colors.semantic.error.light
                  : Colors.semantic.error.dark,
              }
            : { color: isDark ? themeColors.accent.lilac : Colors.lilac[900] },
        ]}
      >
        {label}
      </Text>
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
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
        {title}
      </Text>
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
    width: "auto",
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
  },
  infoChipLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
});
