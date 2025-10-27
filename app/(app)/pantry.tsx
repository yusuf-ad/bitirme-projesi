import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export default function PantryTab() {
  return (
    <View style={styles.container}>
      <Text>Pantry Tab</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
  },
});
