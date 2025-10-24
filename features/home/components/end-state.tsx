import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

interface EndStateProps {
  message?: string;
}

export function EndState({ message = "No more recipes" }: EndStateProps) {
  return (
    <View style={styles.endContainer}>
      <Text style={styles.endText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  endContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  endText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontStyle: "italic",
  },
});
