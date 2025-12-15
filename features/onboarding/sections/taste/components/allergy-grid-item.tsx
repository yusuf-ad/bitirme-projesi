import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { AllergyItem, AllergyThemeColors } from "../types";
import {
  getIngredientDisplayName,
  getIngredientImageUrl,
} from "../utils/allergy-helpers";

interface AllergyGridItemProps {
  item: AllergyItem;
  onPress: (item: AllergyItem) => void;
  colors: AllergyThemeColors;
}

export function AllergyGridItem({
  item,
  onPress,
  colors,
}: AllergyGridItemProps) {
  const ingredientName = getIngredientDisplayName(item);
  const ingredientImageUrl = getIngredientImageUrl(item);

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={[styles.container, { backgroundColor: colors.background.surface }]}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.gray[100] }]}>
        {ingredientImageUrl ? (
          <Image source={{ uri: ingredientImageUrl }} style={styles.image} />
        ) : (
          <MaterialCommunityIcons
            name="food-apple-outline"
            size={24}
            color={colors.gray[400]}
          />
        )}
      </View>
      <Text
        style={[styles.label, { color: colors.text.primary }]}
        numberOfLines={2}
      >
        {ingredientName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: "31%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },
});

