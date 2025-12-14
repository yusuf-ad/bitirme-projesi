import { getThemeColors } from "@/constants/theme";
import {
  PantryItem,
  PantryItemDetailSheet,
  PantryItemsList,
} from "@/features/pantry";
import { pantryService } from "@/features/pantry/services/pantry-service";
import { usePantryQuery } from "@/hooks/use-pantry-query";
import { PANTRY_CATEGORIES } from "@/lib/constants";
import { useTheme } from "@/providers/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PantryItemsScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark, true);
  const insets = useSafeAreaInsets();

  // Bottom sheet for item details
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedItem, setSelectedItem] = useState<PantryItem | null>(null);

  const { data: items = [], isLoading, refetch } = usePantryQuery();

  // Filter items by category
  const filteredItems = useMemo(() => {
    const pantryItems = items.filter((i: PantryItem) => i.status === "pantry");

    if (!category || category === "All") {
      return pantryItems;
    }

    return pantryItems.filter((i: PantryItem) => i.category === category);
  }, [items, category]);

  // Get display title
  const displayTitle = useMemo(() => {
    if (!category || category === "All") {
      return "All Items";
    }
    // Verify category is valid
    if (PANTRY_CATEGORIES.includes(category as any)) {
      return category;
    }
    return "Items";
  }, [category]);

  const handleItemPress = useCallback((item: PantryItem) => {
    setSelectedItem(item);
    bottomSheetRef.current?.present();
  }, []);

  const handleUpdateItem = useCallback(
    async (id: string, updates: Partial<PantryItem>) => {
      try {
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem((prev) => (prev ? { ...prev, ...updates } : null));
        }
        await pantryService.updateItem(id, updates);
        refetch();
      } catch (error) {
        console.error("Failed to update item:", error);
      }
    },
    [selectedItem, refetch]
  );

  const handleRemoveItem = useCallback(
    async (id: string) => {
      try {
        bottomSheetRef.current?.dismiss();
        await pantryService.deleteItem(id);
        refetch();
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
    },
    [refetch]
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors.background.secondary,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>
          {displayTitle}
        </Text>
        <Text style={[styles.headerCount, { color: Colors.text.tertiary }]}>
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
        </Text>
      </View>

      {/* Items List */}
      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.lilac[600]} />
          <Text style={[styles.loadingText, { color: Colors.text.tertiary }]}>
            Loading items...
          </Text>
        </View>
      ) : filteredItems.length > 0 ? (
        <PantryItemsList items={filteredItems} onItemPress={handleItemPress} />
      ) : (
        <View style={styles.emptyState}>
          <Text
            style={[styles.emptyStateText, { color: Colors.text.tertiary }]}
          >
            No items in this category
          </Text>
        </View>
      )}

      {/* Item Detail Sheet */}
      <PantryItemDetailSheet
        ref={bottomSheetRef}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={handleRemoveItem}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
  },
  headerCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
