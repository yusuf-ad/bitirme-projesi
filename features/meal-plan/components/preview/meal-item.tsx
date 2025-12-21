import ReplaceIcon from "@/assets/icons/replace-icon";
import { Colors, getThemeColors } from "@/constants/theme";
import { getMealImageUrl } from "@/lib/utils";
import { useTheme } from "@/providers/theme-provider";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { MealItemProps } from "./types";

export function MealItem({
  meal,
  onReplace,
  onPress,
}: MealItemProps) {
  const imageUrl = getMealImageUrl(meal);
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[600];

  const carbs = meal.nutrition?.carbs
    ? `${Math.round(meal.nutrition.carbs)}g`
    : undefined;
  const protein = meal.nutrition?.protein
    ? `${Math.round(meal.nutrition.protein)}g`
    : undefined;
  const fat = meal.nutrition?.fat
    ? `${Math.round(meal.nutrition.fat)}g`
    : undefined;

  return (
    <View style={styles.mealItem}>
      <Pressable style={styles.mealContent} onPress={onPress}>
        {imageUrl ? (
          <ExpoImage
            source={{ uri: imageUrl }}
            style={[styles.mealImage, { backgroundColor: isDark ? themeColors.background.tertiary : Colors.gray[200] }]}
            contentFit="cover"
            transition={100}
            cachePolicy="disk"
          />
        ) : (
          <View style={[styles.mealImage, styles.placeholderImage, { backgroundColor: isDark ? themeColors.background.tertiary : Colors.gray[300] }]} />
        )}
        <View style={styles.mealInfo}>
          <Text style={[styles.mealTitle, { color: themeColors.text.primary }]}>{meal.title}</Text>
          <View style={styles.mealDetails}>
            {meal.nutrition?.calories && (
              <View style={[styles.detailBadge, { backgroundColor: isDark ? themeColors.background.tertiary : Colors.gray[100], borderColor: isDark ? themeColors.border.light : Colors.gray[200] }]}>
                <Ionicons name="flame" size={12} color="#FF8C00" />
                <Text style={[styles.detailValue, { color: themeColors.text.primary }]}>
                  {Math.round(meal.nutrition.calories)}
                </Text>
                <Text style={[styles.detailUnit, { color: themeColors.text.tertiary }]}>cal</Text>
              </View>
            )}
            {meal.readyInMinutes && (
              <View style={[styles.detailBadge, { backgroundColor: isDark ? themeColors.background.tertiary : Colors.gray[100], borderColor: isDark ? themeColors.border.light : Colors.gray[200] }]}>
                <Ionicons name="time-outline" size={12} color={accentColor} />
                <Text style={[styles.detailValue, { color: themeColors.text.primary }]}>
                  {meal.readyInMinutes}
                </Text>
                <Text style={[styles.detailUnit, { color: themeColors.text.tertiary }]}>min</Text>
              </View>
            )}
          </View>
          {/* Macronutrients */}
          {(carbs || protein || fat) && (
            <View style={styles.macrosContainer}>
              {carbs && (
                <View style={[styles.macroItem, { backgroundColor: isDark ? "rgba(191, 90, 242, 0.15)" : Colors.lilac[100], borderColor: isDark ? themeColors.border.light : Colors.lilac[200] }]}>
                  <Text style={[styles.macroLabel, { color: themeColors.text.tertiary }]}>Carbs</Text>
                  <Text style={[styles.macroValue, { color: accentColor }]}>{carbs}</Text>
                </View>
              )}
              {protein && (
                <View style={[styles.macroItem, { backgroundColor: isDark ? "rgba(191, 90, 242, 0.15)" : Colors.lilac[100], borderColor: isDark ? themeColors.border.light : Colors.lilac[200] }]}>
                  <Text style={[styles.macroLabel, { color: themeColors.text.tertiary }]}>Protein</Text>
                  <Text style={[styles.macroValue, { color: accentColor }]}>{protein}</Text>
                </View>
              )}
              {fat && (
                <View style={[styles.macroItem, { backgroundColor: isDark ? "rgba(191, 90, 242, 0.15)" : Colors.lilac[100], borderColor: isDark ? themeColors.border.light : Colors.lilac[200] }]}>
                  <Text style={[styles.macroLabel, { color: themeColors.text.tertiary }]}>Fat</Text>
                  <Text style={[styles.macroValue, { color: accentColor }]}>{fat}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Pressable>
      <CustomButton containerStyle={[styles.replaceButton, { backgroundColor: isDark ? "rgba(191, 90, 242, 0.15)" : Colors.lilac[100], borderColor: isDark ? accentColor : Colors.lilac[300] }]} onPress={onReplace}>
        <ReplaceIcon color={accentColor} />
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  mealContent: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  mealImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  placeholderImage: {},
  mealInfo: {
    flex: 1,
    gap: 4,
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  mealDetails: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
  },
  detailUnit: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
  },
  replaceButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
  },
  macrosContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 12,
  },
  macroValue: {
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
});
