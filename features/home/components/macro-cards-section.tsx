import MacroCard from "@/shared/components/macro-card";
import { StyleSheet, View } from "react-native";

export default function MacroCardsSection() {
  return (
    <View style={styles.macroCardsContainer}>
      <MacroCard
        label="Carbs"
        currentValue={241}
        maxValue={359}
        unit="g"
        color="#5B9FFF"
        lightColor="#DDE8FF"
        decorationColor="#A3C8FF"
      />
      <MacroCard
        label="Protein"
        currentValue={120}
        maxValue={143}
        unit="g"
        color="#4CAF50"
        lightColor="#D7F0D9"
        decorationColor="#337735ff"
      />
      <MacroCard
        label="Fat"
        currentValue={179}
        maxValue={370}
        unit="g"
        color="#FFB84D"
        lightColor="#FFF0D9"
        decorationColor="#a57733ff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  macroCardsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
});
