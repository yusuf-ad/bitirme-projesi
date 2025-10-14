import { StyleSheet, Text, View } from "react-native";

export default function GroceriesTab() {
  return (
    <View style={styles.container}>
      <Text>Groceries Tab</Text>
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
