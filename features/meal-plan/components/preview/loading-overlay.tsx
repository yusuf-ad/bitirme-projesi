import { Colors } from "@/constants/theme";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import type { LoadingOverlayProps } from "./types";

const DEFAULT_MESSAGE = "Checking pantry and adding\nmissing ingredients...";

export function LoadingOverlay({
  visible,
  message = DEFAULT_MESSAGE,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.lilac[600]} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 16,
    marginHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

