import ReplaceIcon from "@/assets/icons/replace-icon";
import { Colors } from "@/constants/theme";
import { getMealImageUrl } from "@/lib/utils";
import CustomButton from "@/shared/components/custom-button";
import { Image as ExpoImage } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { MealItemProps } from "./types";

export function MealItem({
  meal,
  onReplace,
  onPress,
}: MealItemProps) {
  const imageUrl = getMealImageUrl(meal);

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
            style={styles.mealImage}
            contentFit="cover"
            transition={100}
            cachePolicy="disk"
          />
        ) : (
          <View style={[styles.mealImage, styles.placeholderImage]} />
        )}
        <View style={styles.mealInfo}>
          <Text style={styles.mealTitle}>{meal.title}</Text>
          <View style={styles.mealDetails}>
            {meal.nutrition?.calories && (
              <Text style={styles.mealDetailText}>
                {Math.round(meal.nutrition.calories)} cal
              </Text>
            )}
            <Text>|</Text>
            {meal.readyInMinutes && (
              <Text style={styles.mealDetailText}>
                {meal.readyInMinutes} min
              </Text>
            )}
          </View>
          {/* Macronutrients */}
          {(carbs || protein || fat) && (
            <View style={styles.macrosContainer}>
              {carbs && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{carbs}</Text>
                </View>
              )}
              {protein && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{protein}</Text>
                </View>
              )}
              {fat && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroLabel}>Fat</Text>
                  <Text style={styles.macroValue}>{fat}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Pressable>
      <CustomButton containerStyle={styles.replaceButton} onPress={onReplace}>
        <ReplaceIcon />
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  mealContent: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
  },
  mealImage: {
    width: 73,
    height: 73,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
  },
  placeholderImage: {
    backgroundColor: Colors.gray[300],
  },
  mealInfo: {
    flex: 1,
    gap: 6,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: Colors.text.primary,
  },
  mealDetails: {
    flexDirection: "row",
    gap: 12,
  },
  mealDetailText: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
    color: Colors.text.secondary,
  },
  replaceButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lilac[900],
    borderRadius: 8,
  },
  macrosContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.background.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 16,
    color: Colors.gray[500],
  },
  macroValue: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
    color: Colors.lilac[900],
  },
});

