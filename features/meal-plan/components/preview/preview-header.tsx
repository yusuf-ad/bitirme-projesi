import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { PreviewHeaderProps } from "./types";

export function PreviewHeader({ onBack, onClose }: PreviewHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8}>
        <MaterialIcons
          name="arrow-back"
          size={24}
          color={Colors.text.primary}
        />
      </Pressable>
      <Text style={styles.headerTitle}>Meal plan preview</Text>
      <Pressable onPress={onClose} hitSlop={8}>
        <Text style={styles.closeButton}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  closeButton: {
    fontSize: 16,
    color: Colors.lilac[600],
    fontWeight: "500",
  },
});

