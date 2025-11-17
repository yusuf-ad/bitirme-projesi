import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import type { MealType, MealTypeOption } from "../types";
import { MealSelectionCard } from "./meal-selection-card";

interface DateMealRowProps {
  date: string;
  mealTypes: MealTypeOption[];
  selectedMealTypes: Record<MealType, boolean>;
  onToggleMealType: (mealType: MealType) => void;
}

export function DateMealRow({
  date,
  mealTypes,
  selectedMealTypes,
  onToggleMealType,
}: DateMealRowProps) {
  const dateObj = new Date(date);

  return (
    <View style={styles.container}>
      <View style={styles.dateInfo}>
        <Text style={styles.dayText}>
          {dateObj.toLocaleDateString("en-US", { weekday: "short" })}
        </Text>
        <Text style={styles.dateText}>
          {dateObj.toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
          })}
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {mealTypes.map((option) => (
          <MealSelectionCard
            key={option.id}
            isSelected={selectedMealTypes[option.id]}
            onPress={() => onToggleMealType(option.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 32,
    marginTop: 8,
  },
  dateInfo: {
    flexDirection: "column",
    gap: 0,
    paddingHorizontal: 1,
    width: 60,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    color: Colors.text.primary,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 24,
    color: "#737780",
  },
  cardsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
});

