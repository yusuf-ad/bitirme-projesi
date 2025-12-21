import { Colors, getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { PreviewHeaderProps } from "./types";

export function PreviewHeader({ onBack, onClose }: PreviewHeaderProps) {
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);

  return (
    <View style={[styles.header, { backgroundColor: themeColors.background.primary, borderBottomColor: isDark ? themeColors.border.light : Colors.lilac[100] }]}>
      <Pressable onPress={onBack} style={[styles.headerButton, { backgroundColor: isDark ? themeColors.background.surface : Colors.gray[100] }]} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={themeColors.text.primary} />
      </Pressable>
      <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>Meal Plan Preview</Text>
      <Pressable onPress={onClose} style={[styles.headerButton, { backgroundColor: isDark ? themeColors.background.surface : Colors.gray[100] }]} hitSlop={8}>
        <Ionicons name="close" size={22} color={themeColors.text.tertiary} />
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
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
});

