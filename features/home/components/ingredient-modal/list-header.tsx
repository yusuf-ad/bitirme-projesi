import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { IngredientItemComponent } from "./ingredient-item";
import { IngredientItem } from "./types";

interface ListHeaderComponentProps {
  selectedItems: IngredientItem[];
  isScrolledDown: boolean;
  hasSearched: boolean;
  getIngredientKey: (item: IngredientItem) => string;
  toggleIngredient: (item: IngredientItem) => void;
}

export const ListHeaderComponent = ({
  selectedItems,
  isScrolledDown,
  hasSearched,
  getIngredientKey,
  toggleIngredient,
}: ListHeaderComponentProps) => {
  return (
    <View>
      {/* Selected Items Section */}
      {selectedItems.length > 0 && !isScrolledDown && (
        <View>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIconWrapper}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.lilac[600]}
                />
              </View>
              <Text style={styles.subtitle}>Selected</Text>
            </View>
            <View style={styles.selectedCountBadge}>
              <Text style={styles.selectedCountText}>
                {selectedItems.length}
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedItemsContainer}
          >
            {selectedItems.map((item) => (
              <IngredientItemComponent
                key={`selected-${getIngredientKey(item)}`}
                item={item}
                isSelected={true}
                onPress={() => toggleIngredient(item)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconWrapper}>
            <Ionicons
              name={hasSearched ? "search" : "flame"}
              size={16}
              color={hasSearched ? Colors.lilac[600] : "#F59E0B"}
            />
          </View>
          <Text style={styles.subtitle}>
            {hasSearched ? "Search Results" : "Popular Ingredients"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.lilac[100],
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    letterSpacing: -0.2,
  },
  selectedCountBadge: {
    backgroundColor: Colors.lilac[600],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedCountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  selectedItemsContainer: {
    paddingBottom: 16,
    gap: 10,
  },
});
