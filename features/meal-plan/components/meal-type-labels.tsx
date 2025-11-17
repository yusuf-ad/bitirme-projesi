import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import type { MealTypeOption } from "../types";

interface MealTypeLabelsProps {
  mealTypes: MealTypeOption[];
}

export function MealTypeLabels({ mealTypes }: MealTypeLabelsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.emptyLabelSpace} />

      <View style={styles.labelsContainer}>
        {mealTypes.map((option) => (
          <View key={option.id} style={styles.label}>
            <Text style={styles.labelText}>{option.label}</Text>
          </View>
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
  },
  emptyLabelSpace: {
    width: 60,
  },
  labelsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  label: {
    flex: 1,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 24,
    textAlign: "center",
    color: Colors.text.primary,
  },
});

