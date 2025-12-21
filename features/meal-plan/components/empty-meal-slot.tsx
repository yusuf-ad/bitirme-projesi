import { Colors, getThemeColors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useTheme } from "@/providers/theme-provider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Animated, { FadeInDown } from "react-native-reanimated";

interface EmptyMealSlotProps {
  mealType: string;
  mealTime: string;
  mealIcon: ImageSourcePropType;
  mealSlot: "breakfast" | "lunch" | "dinner";
  selectedDate: Date;
  onMealAdded?: () => void;
}

export function EmptyMealSlot({
  mealType,
  mealTime,
  mealIcon,
  mealSlot,
  selectedDate,
  onMealAdded,
}: EmptyMealSlotProps) {
  const { impact } = useHaptics();
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[900];

  // Check if date is in the past
  const isPastDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const normalizedSelectedDate = new Date(selectedDate);
    normalizedSelectedDate.setHours(0, 0, 0, 0);
    return normalizedSelectedDate < today;
  }, [selectedDate]);

  const handlePress = async () => {
    if (isPastDate) return;
    impact();
    router.push({
      pathname: "/(app)/recipes",
      params: { mealSlot },
    });
  };

  const handleOpenAiRecipe = async () => {
    if (isPastDate) return;
    impact();
    // Format date as YYYY-MM-DD without UTC conversion
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    router.push({
      pathname: "/ai-recipe",
      params: {
        mealSlot,
        selectedDate: formattedDate,
        mealType: mealSlot,
      },
    });
  };

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          { 
            backgroundColor: themeColors.background.surface,
            borderColor: isDark ? themeColors.border.light : Colors.lilac[200],
          },
          pressed && !isPastDate && [styles.containerPressed, { borderColor: accentColor }],
          isPastDate && styles.containerDisabled,
        ]}
        onPress={handlePress}
        disabled={isPastDate}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? themeColors.border.light : Colors.lilac[200] }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[styles.mealIconContainer, { borderColor: isDark ? themeColors.border.light : Colors.lilac[200], backgroundColor: isDark ? themeColors.background.tertiary : "#F3F3F3" }]}>
              <Image source={mealIcon} style={styles.mealIcon} />
            </View>
            <View style={styles.mealInfo}>
              <Text style={[styles.mealType, { color: themeColors.text.primary }]}>{mealType}</Text>
              <Text style={[styles.mealTime, { color: themeColors.text.tertiary }]}>{mealTime}</Text>
            </View>
          </View>

          {!isPastDate && (
            <Pressable 
              style={[
                styles.aiButton, 
                { 
                  borderColor: isDark ? accentColor : Colors.lilac[300],
                  backgroundColor: isDark ? "rgba(191, 90, 242, 0.15)" : Colors.lilac[100],
                }
              ]} 
              onPress={handleOpenAiRecipe}
            >
              <MaterialIcons
                name="auto-awesome"
                size={18}
                color={accentColor}
              />
              <Text style={[styles.aiButtonText, { color: accentColor }]}>AI</Text>
            </Pressable>
          )}
        </View>

        {/* Empty State Content - Static */}
        <View style={styles.emptyContentWrapper}>
          <View style={styles.emptyContent}>
            <View style={[
              styles.emptyIconContainer,
              { backgroundColor: isDark ? "rgba(191, 90, 242, 0.15)" : Colors.lilac[100] }
            ]}>
              <Text style={styles.emptyIcon}>🍽️</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: themeColors.text.primary }]}>
              {isPastDate ? `No ${mealType.toLowerCase()} recorded` : `${mealType} not added yet`}
            </Text>
            <Text style={[styles.emptyDescription, { color: themeColors.text.secondary }]}>
              {isPastDate 
                ? "You can only view past meals"
                : "Tap to add a meal from the recipes page"}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  containerPressed: {
    opacity: 0.7,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mealIcon: {
    width: 40,
    height: 40,
  },
  mealInfo: {
    justifyContent: "center",
  },
  mealType: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 21,
  },
  mealTime: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 21,
  },
  emptyContentWrapper: {
    minHeight: 160,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  emptyDescription: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    textAlign: "center",
    maxWidth: 240,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

