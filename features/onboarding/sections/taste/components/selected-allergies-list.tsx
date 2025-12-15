import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { AllergyItem, AllergyThemeColors } from "../types";
import {
  getIngredientDisplayName,
  getIngredientImageUrl,
} from "../utils/allergy-helpers";

interface SelectedAllergiesListProps {
  selectedItems: AllergyItem[];
  onRemove: (item: AllergyItem) => void;
  colors: AllergyThemeColors;
}

export function SelectedAllergiesList({
  selectedItems,
  onRemove,
  colors,
}: SelectedAllergiesListProps) {
  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: "#EF444415" }]}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={16}
            color="#EF4444"
          />
        </View>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Avoiding ({selectedItems.length})
        </Text>
      </View>

      {/* Chips List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {selectedItems.map((item, index) => {
          const ingredientName = getIngredientDisplayName(item);
          const ingredientImageUrl = getIngredientImageUrl(item);

          return (
            <Pressable
              key={`selected-${index}`}
              onPress={() => onRemove(item)}
              style={styles.chip}
            >
              {ingredientImageUrl ? (
                <Image
                  source={{ uri: ingredientImageUrl }}
                  style={styles.chipImage}
                />
              ) : (
                <View style={styles.chipImagePlaceholder}>
                  <MaterialCommunityIcons
                    name="food-off"
                    size={14}
                    color="#EF4444"
                  />
                </View>
              )}
              <Text style={styles.chipLabel} numberOfLines={1}>
                {ingredientName}
              </Text>
              <View style={styles.removeIcon}>
                <MaterialCommunityIcons name="close" size={12} color="#FFFFFF" />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  chipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 10,
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
  },
  chipImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  chipImagePlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#DC2626",
    maxWidth: 100,
  },
  removeIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
});

