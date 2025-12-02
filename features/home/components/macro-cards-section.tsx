import MacroCard from "@/shared/components/macro-card";
import { StyleSheet, View } from "react-native";

interface MacroCardsSectionProps {
  totalCarbs?: number;
  totalProtein?: number;
  totalFat?: number;
  goalCarbs?: number;
  goalProtein?: number;
  goalFat?: number;
}

export default function MacroCardsSection({
  totalCarbs = 0,
  totalProtein = 0,
  totalFat = 0,
  goalCarbs = 275,
  goalProtein = 138,
  goalFat = 61,
}: MacroCardsSectionProps) {
  return (
    <View style={styles.macroCardsContainer}>
      <MacroCard
        label="Carbs"
        currentValue={Math.round(totalCarbs)}
        maxValue={goalCarbs}
        unit="g"
      />
      <MacroCard
        label="Protein"
        currentValue={Math.round(totalProtein)}
        maxValue={goalProtein}
        unit="g"
      />
      <MacroCard
        label="Fat"
        currentValue={Math.round(totalFat)}
        maxValue={goalFat}
        unit="g"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  macroCardsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
});
