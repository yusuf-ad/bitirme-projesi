import { StyleSheet, Text, View } from "react-native";

export default function MealPlanTab() {
  return (
    <View style={styles.container}>
      <Text>Meal Plan Tab</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
