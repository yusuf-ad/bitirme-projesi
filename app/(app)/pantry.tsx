import { getThemeColors } from "@/constants/theme";
import {
  EmptyPantryState,
  PantryCategory,
  PantryCategoryPreview,
  PantryChatView,
  PantryItem,
  PantryItemDetailSheet,
  PantryScreenHeader,
  PantrySkeleton,
  TabType,
} from "@/features/pantry";
import { pantryService } from "@/features/pantry/services/pantry-service";
import { PANTRY_CATEGORIES } from "@/lib/constants";
import { getCommonPantryIngredients } from "@/lib/spoonacular";
import { useTheme } from "@/providers/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PantryTab() {
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark, true); // true = content tab (lighter dark mode)
  const [activeTab, setActiveTab] = useState<TabType>("my-ingredients");
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { refresh } = useLocalSearchParams();

  // Bottom sheet for item details
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedItem, setSelectedItem] = useState<PantryItem | null>(null);

  const fetchItems = async () => {
    try {
      console.log("Fetching pantry items...");
      const data = await pantryService.getAllItems();
      console.log("Fetched items count:", data.length);
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log("Pantry screen focused");
      fetchItems();
    }, [])
  );

  useEffect(() => {
    if (refresh) {
      console.log("Refetching due to refresh param:", refresh);
      fetchItems();
    }
  }, [refresh]);

  // Filter items based on status
  const pantryStockItems = useMemo(
    () => items.filter((i) => i.status === "pantry"),
    [items]
  );
  const shoppingListCount = items.filter(
    (i) => i.status === "shopping_list"
  ).length;

  // Filter based on search query
  const filteredPantryItems = pantryStockItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mapAisleToCategory = (aisle: string): PantryCategory => {
    const lowerAisle = (aisle || "").toLowerCase();
    if (
      lowerAisle.includes("produce") ||
      lowerAisle.includes("fruit") ||
      lowerAisle.includes("vegetable")
    )
      return "Fruits & Vegetables";
    if (
      lowerAisle.includes("meat") ||
      lowerAisle.includes("seafood") ||
      lowerAisle.includes("fish")
    )
      return "Meat & Seafood";
    if (
      lowerAisle.includes("milk") ||
      lowerAisle.includes("cheese") ||
      lowerAisle.includes("dairy") ||
      lowerAisle.includes("egg")
    )
      return "Dairy";
    if (
      lowerAisle.includes("pasta") ||
      lowerAisle.includes("grain") ||
      lowerAisle.includes("rice") ||
      lowerAisle.includes("cereal") ||
      lowerAisle.includes("baking")
    )
      return "Pasta, Sauces & Grain";
    if (lowerAisle.includes("bakery") || lowerAisle.includes("bread"))
      return "Bakery";
    if (lowerAisle.includes("frozen")) return "Frozen";
    if (lowerAisle.includes("canned")) return "Canned";
    if (
      lowerAisle.includes("spice") ||
      lowerAisle.includes("seasoning") ||
      lowerAisle.includes("oil")
    )
      return "Spices";
    if (
      lowerAisle.includes("condiment") ||
      lowerAisle.includes("dressing") ||
      lowerAisle.includes("nut")
    )
      return "Condiments";
    if (lowerAisle.includes("snack") || lowerAisle.includes("chip"))
      return "Snacks";
    return "Other";
  };

  const handlePrefill = async () => {
    try {
      setIsLoading(true);
      const commonIngredients = await getCommonPantryIngredients();

      const newItems = commonIngredients.map((ing) => {
        const category = mapAisleToCategory(ing.aisle);
        return {
          name: ing.name,
          amount: 1,
          unit: "pkg",
          is_weight: false,
          category: category,
          status: "pantry" as const,
          checked: false,
          spoonacular_id: ing.id,
          spoonacular_image: ing.image,
          spoonacular_name: ing.name,
        };
      });

      await pantryService.addItems(newItems);
      await fetchItems();
    } catch (error) {
      console.error("Failed to pre-fill pantry:", error);
      Alert.alert("Error", "Failed to pre-fill pantry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemPress = (item: PantryItem) => {
    setSelectedItem(item);
    bottomSheetRef.current?.present();
  };

  const handleUpdateItem = async (id: string, updates: Partial<PantryItem>) => {
    try {
      // Optimistically update local state
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
      );
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem((prev) => (prev ? { ...prev, ...updates } : null));
      }
      // Call API
      await pantryService.updateItem(id, updates);
    } catch (error) {
      console.error("Failed to update item:", error);
      // Revert/Fetch if needed, simplified for now
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      // Optimistically update
      setItems((prev) => prev.filter((i) => i.id !== id));
      bottomSheetRef.current?.dismiss();
      await pantryService.deleteItem(id);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear Pantry",
      "Are you sure you want to remove all items from your pantry? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              // Optimistically clear local state
              setItems((prev) => prev.filter((i) => i.status !== "pantry"));
              await pantryService.clearPantryItems();
            } catch (error) {
              console.error("Failed to clear pantry:", error);
              Alert.alert("Error", "Failed to clear pantry items");
              fetchItems(); // Revert on error
            }
          },
        },
      ]
    );
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background.secondary }]}>
        <PantryScreenHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          shoppingListCount={0}
        />
        <PantrySkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background.secondary }]}>
      <PantryScreenHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        shoppingListCount={shoppingListCount}
        ingredientsCount={pantryStockItems.length}
        onClear={handleClearAll}
      />

      {activeTab === "my-ingredients" ? (
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom * 2 + 52 },
          ]}
        >
          <View style={styles.categoriesContainer}>
            {pantryStockItems.length === 0 && !searchQuery ? (
              <EmptyPantryState onPrefill={handlePrefill} />
            ) : (
              <>
                {searchQuery ? (
                  PANTRY_CATEGORIES.map((category) => {
                    const categoryItems = filteredPantryItems.filter(
                      (i) => i.category === category
                    );
                    if (categoryItems.length === 0) return null;
                    return (
                      <PantryCategoryPreview
                        key={category}
                        title={category}
                        items={categoryItems}
                        onItemPress={handleItemPress}
                      />
                    );
                  })
                ) : (
                  <>
                    <PantryCategoryPreview
                      title="All"
                      items={filteredPantryItems}
                      onItemPress={handleItemPress}
                    />
                    {PANTRY_CATEGORIES.map((category) => {
                      const categoryItems = filteredPantryItems.filter(
                        (i) => i.category === category
                      );
                      if (categoryItems.length === 0) return null;
                      return (
                        <PantryCategoryPreview
                          key={category}
                          title={category}
                          items={categoryItems}
                          onItemPress={handleItemPress}
                        />
                      );
                    })}
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>
      ) : (
        <PantryChatView />
      )}

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
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    marginTop: 16,
    gap: 16,
  },
  placeholderContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    textAlign: "center",
    fontSize: 16,
  },
});
