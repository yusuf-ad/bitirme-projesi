import { Colors } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = "Error loading recipes. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: Colors.semantic.error.light,
    borderRadius: 12,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.semantic.error.dark,
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: Colors.semantic.error.main,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
