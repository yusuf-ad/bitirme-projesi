import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import type { AllergyItem, AllergyThemeColors } from "../types";
import { getIngredientKey } from "../utils/allergy-helpers";
import { AllergyGridItem } from "./allergy-grid-item";

interface AllergyGridProps {
  items: AllergyItem[];
  isSearching: boolean;
  hasSearched: boolean;
  onItemPress: (item: AllergyItem) => void;
  colors: AllergyThemeColors;
}

export function AllergyGrid({
  items,
  isSearching,
  hasSearched,
  onItemPress,
  colors,
}: AllergyGridProps) {
  // Loading state
  if (isSearching) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={colors.lilac[900]} />
        <Text style={[styles.stateText, { color: colors.text.secondary }]}>
          Searching...
        </Text>
      </View>
    );
  }

  // Empty state after search
  if (hasSearched && items.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <MaterialCommunityIcons
          name="magnify-close"
          size={48}
          color={colors.gray[300]}
        />
        <Text style={[styles.emptyTitle, { color: colors.text.secondary }]}>
          No ingredients found
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.text.tertiary }]}>
          Try a different search term
        </Text>
      </View>
    );
  }

  // Grid of items
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${colors.lilac[900]}15` },
          ]}
        >
          <MaterialCommunityIcons
            name="food-variant"
            size={16}
            color={colors.lilac[900]}
          />
        </View>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {hasSearched ? "Search Results" : "Common Ingredients"}
        </Text>
      </View>

      {/* Items Grid */}
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <AllergyGridItem item={item} onPress={onItemPress} colors={colors} />
        )}
        keyExtractor={(item, index) => `item-${index}-${getIngredientKey(item)}`}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  gridContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  gridRow: {
    gap: 10,
  },
  stateContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 13,
  },
});

