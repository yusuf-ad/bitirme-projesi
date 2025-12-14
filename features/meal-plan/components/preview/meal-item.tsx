import ReplaceIcon from "@/assets/icons/replace-icon";
import { Colors } from "@/constants/theme";
import { getMealImageUrl } from "@/lib/utils";
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
              <View style={styles.detailBadge}>
                <Ionicons name="flame" size={12} color="#FF8C00" />
                <Text style={styles.detailValue}>
                  {Math.round(meal.nutrition.calories)}
                </Text>
                <Text style={styles.detailUnit}>cal</Text>
              </View>
            )}
            {meal.readyInMinutes && (
              <View style={styles.detailBadge}>
                <Ionicons name="time-outline" size={12} color={Colors.lilac[600]} />
                <Text style={styles.detailValue}>
                  {meal.readyInMinutes}
                </Text>
                <Text style={styles.detailUnit}>min</Text>
              </View>
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
    backgroundColor: Colors.gray[200],
  },
  placeholderImage: {
    backgroundColor: Colors.gray[300],
  },
  mealInfo: {
    flex: 1,
    gap: 4,
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    color: Colors.text.primary,
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
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
    color: Colors.text.primary,
  },
  detailUnit: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
    color: Colors.text.tertiary,
  },
  replaceButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.lilac[300],
    borderRadius: 10,
    backgroundColor: Colors.lilac[100],
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
    backgroundColor: Colors.lilac[100],
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 12,
    color: Colors.text.tertiary,
  },
  macroValue: {
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
    color: Colors.lilac[800],
  },
});

