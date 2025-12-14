import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { PreviewHeaderProps } from "./types";

export function PreviewHeader({ onBack, onClose }: PreviewHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.headerButton} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
      </Pressable>
      <Text style={styles.headerTitle}>Meal Plan Preview</Text>
      <Pressable onPress={onClose} style={styles.headerButton} hitSlop={8}>
        <Ionicons name="close" size={22} color={Colors.gray[500]} />
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
    backgroundColor: Colors.background.primary,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
  },
});

