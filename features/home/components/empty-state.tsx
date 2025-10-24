import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "No recipes found" }: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
});
