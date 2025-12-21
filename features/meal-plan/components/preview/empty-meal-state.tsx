import ReplaceIcon from "@/assets/icons/replace-icon";
import { Colors, getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import CustomButton from "@/shared/components/custom-button";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { capitalizeFirst } from "./preview-utils";
import type { EmptyMealStateProps } from "./types";

export function EmptyMealState({
  mealType,
  onGenerateWithAI,
  onReplace,
}: EmptyMealStateProps) {
  const mealTypeLabel = capitalizeFirst(mealType);
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[900];

  return (
    <View>
      <View style={styles.skeletonMealItem}>
        {/* Skeleton Image */}
        <View style={[styles.skeletonImage, { backgroundColor: isDark ? themeColors.background.tertiary : Colors.gray[200], borderColor: isDark ? themeColors.border.light : Colors.gray[300] }]}>
          <MaterialIcons name="image" size={28} color={isDark ? themeColors.text.tertiary : Colors.gray[400]} />
        </View>
        {/* Skeleton Content */}
        <View style={styles.skeletonContent}>
          <View style={[styles.skeletonTitleLine, { backgroundColor: isDark ? themeColors.background.tertiary : Colors.gray[200] }]} />
          <View style={[styles.skeletonDetailLine, { backgroundColor: isDark ? themeColors.background.tertiary : Colors.gray[200] }]} />
          {/* AI Generate Button */}
          <Pressable
            style={[styles.aiGenerateButton, { backgroundColor: accentColor }]}
            onPress={() => onGenerateWithAI(mealType)}
          >
            <MaterialIcons name="auto-awesome" size={16} color="#fff" />
            <Text style={styles.aiGenerateButtonText}>Generate with AI</Text>
          </Pressable>
        </View>
        {/* Replace Button */}
        <CustomButton
          containerStyle={[styles.replaceButton, { borderColor: accentColor }]}
          onPress={() => onReplace(mealType)}
        >
          <ReplaceIcon color={accentColor} />
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonMealItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  skeletonImage: {
    width: 73,
    height: 73,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonTitleLine: {
    height: 16,
    width: "70%",
    borderRadius: 4,
  },
  skeletonDetailLine: {
    height: 12,
    width: "40%",
    borderRadius: 4,
  },
  aiGenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  aiGenerateButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  replaceButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
  },
});

