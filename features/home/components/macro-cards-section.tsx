import MacroCard from "@/shared/components/macro-card";
import { StyleSheet, View } from "react-native";

export default function MacroCardsSection() {
  return (
    <View style={styles.macroCardsContainer}>
      <MacroCard label="Carbs" currentValue={241} maxValue={359} unit="g" />
      <MacroCard label="Protein" currentValue={120} maxValue={143} unit="g" />
      <MacroCard label="Fat" currentValue={179} maxValue={370} unit="g" />
    </View>
  );
}

const styles = StyleSheet.create({
  macroCardsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    marginTop: 8,
  },
});
