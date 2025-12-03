import { Colors } from "@/constants/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { memo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { INGREDIENT_IMAGE_BASE_URL } from "./constants";
import { FloatingChipProps } from "./types";

export const FloatingChip = memo(({ item, onPress }: FloatingChipProps) => {
  const ingredientName = (item as any).name;
  const ingredientImage = (item as any).image;

  return (
    <View style={styles.floatingChip}>
      <Pressable
        style={({ pressed }) => [
          styles.floatingChipContent,
          pressed && styles.floatingChipPressed,
        ]}
        onPress={onPress}
      >
        {ingredientImage ? (
          <Image
            source={{
              uri: `${INGREDIENT_IMAGE_BASE_URL}/${ingredientImage}`,
            }}
            style={styles.floatingChipImage}
          />
        ) : (
          <View
            style={[
              styles.floatingChipImage,
              styles.floatingChipImagePlaceholder,
            ]}
          />
        )}
        <Text style={styles.floatingChipText} numberOfLines={1}>
          {ingredientName}
        </Text>
        <View style={styles.floatingChipRemove}>
          <AntDesign name="close" size={10} color={Colors.lilac[600]} />
        </View>
      </Pressable>
    </View>
  );
});

FloatingChip.displayName = "FloatingChip";

const styles = StyleSheet.create({
  floatingChip: {
    marginRight: 8,
  },
  floatingChipContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lilac[100],
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    gap: 6,
  },
  floatingChipPressed: {
    backgroundColor: Colors.lilac[200],
    transform: [{ scale: 0.95 }],
  },
  floatingChipImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.lilac[300],
  },
  floatingChipImagePlaceholder: {
    backgroundColor: Colors.gray[100],
  },
  floatingChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.lilac[800],
    maxWidth: 80,
  },
  floatingChipRemove: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.lilac[200],
    alignItems: "center",
    justifyContent: "center",
  },
});
