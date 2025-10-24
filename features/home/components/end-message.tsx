import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

interface EndMessageProps {
  message?: string;
}

export function EndMessage({ message = "No more recipes" }: EndMessageProps) {
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
