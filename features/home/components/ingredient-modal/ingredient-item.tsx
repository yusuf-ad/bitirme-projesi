import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { INGREDIENT_IMAGE_BASE_URL, NUM_COLUMNS } from "./constants";
import { IngredientItemComponentProps } from "./types";

export const IngredientItemComponent = memo(
  ({ item, isSelected, onPress }: IngredientItemComponentProps) => {
    const ingredientName = (item as any).name;
    const ingredientImage = (item as any).image;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.ingredientItem,
          isSelected && styles.ingredientItemSelected,
          pressed && styles.ingredientItemPressed,
        ]}
        onPress={onPress}
      >
        <View style={styles.ingredientImageWrapper}>
          {ingredientImage ? (
            <Image
              source={{
                uri: `${INGREDIENT_IMAGE_BASE_URL}/${ingredientImage}`,
              }}
              style={[
                styles.ingredientCircle,
                isSelected && styles.ingredientCircleSelected,
              ]}
            />
          ) : (
            <View
              style={[
                styles.ingredientCircle,
                styles.ingredientCirclePlaceholder,
              ]}
            />
          )}
          {isSelected && <View style={styles.selectedRing} />}
        </View>
        <Text
          style={[
            styles.ingredientText,
            isSelected && styles.ingredientTextSelected,
          ]}
          numberOfLines={2}
        >
          {ingredientName}
        </Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <LinearGradient
              colors={[Colors.lilac[600], Colors.lilac[800]]}
              style={styles.checkmarkGradient}
            >
              <Ionicons name="checkmark" size={14} color="white" />
            </LinearGradient>
          </View>
        )}
      </Pressable>
    );
  }
);

IngredientItemComponent.displayName = "IngredientItemComponent";

// Container has paddingHorizontal: 20 (total 40), so available width is screen - 40
const ITEM_WIDTH = (Dimensions.get("window").width - 40) / NUM_COLUMNS;

const styles = StyleSheet.create({
  ingredientItem: {
    width: ITEM_WIDTH,
    alignItems: "center",
    position: "relative",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  ingredientItemPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  ingredientItemSelected: {
    backgroundColor: Colors.lilac[100],
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  ingredientImageWrapper: {
    position: "relative",
    marginBottom: 4,
  },
  ingredientCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#F3F4F6",
    objectFit: "contain",
  },
  ingredientCircleSelected: {
    borderColor: Colors.lilac[400],
    borderWidth: 2,
  },
  ingredientCirclePlaceholder: {
    backgroundColor: Colors.gray[100],
  },
  selectedRing: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.lilac[500],
    borderStyle: "dashed",
  },
  ingredientText: {
    fontSize: 11,
    color: Colors.text.primary,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 14,
    maxWidth: ITEM_WIDTH - 8,
  },
  ingredientTextSelected: {
    color: Colors.lilac[800],
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: 0,
    right: 2,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: Colors.lilac[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmarkGradient: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
