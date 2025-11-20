import { Colors } from "@/constants/theme";
import {
  CategorySection,
  EmptyPantryState,
  PantryCategory,
  PantryCategoryPreview,
  PantryItem,
  PantryScreenHeader,
  PantrySkeleton,
  TabType,
} from "@/features/pantry";
import { pantryService } from "@/features/pantry/services/pantry-service";
import { PANTRY_CATEGORIES } from "@/lib/constants";
import { getCommonPantryIngredients } from "@/lib/spoonacular";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PantryTab() {
  const [activeTab, setActiveTab] = useState<TabType>("pantry");
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { refresh } = useLocalSearchParams();

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
  const pantryStockItems = items.filter((i) => i.status === "pantry");
  const shoppingListItems = items.filter((i) => i.status === "shopping_list");

  // Filter based on search query
  const filteredPantryItems = pantryStockItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredShoppingItems = shoppingListItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newChecked = !item.checked;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: newChecked } : i))
    );

    try {
      await pantryService.updateItem(id, { checked: newChecked });
    } catch (error) {
      console.error("Failed to update item", error);
      // Revert
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: !newChecked } : i))
      );
    }
  };

  const getCategoryItems = (itemsList: PantryItem[], category: string) => {
    return itemsList.filter(
      (item) => !item.checked && item.category === category
    );
  };

  const getCheckedItems = (itemsList: PantryItem[]) => {
    return itemsList.filter((item) => item.checked);
  };

  const handleEditItem = (id: string) => {
    // TODO: Implement edit item functionality
    console.log("Edit item:", id);
  };

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

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.container}>
        <PantryScreenHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          pantryCount={0}
          shoppingListCount={0}
        />
        <PantrySkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PantryScreenHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pantryCount={pantryStockItems.length}
        shoppingListCount={shoppingListItems.length}
      />

      {/* Content - Scrollable */}
      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom * 2 + 52 },
        ]}
      >
        <View style={styles.categoriesContainer}>
          {activeTab === "pantry" ? (
            pantryStockItems.length === 0 && !searchQuery ? (
              <EmptyPantryState onPrefill={handlePrefill} />
            ) : (
              <>
                {searchQuery ? (
                  // If searching, just show flat list or categorized? Categorized is better
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
                      />
                    );
                  })
                ) : (
                  <>
                    <PantryCategoryPreview
                      title="All"
                      items={filteredPantryItems}
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
                        />
                      );
                    })}
                  </>
                )}
              </>
            )
          ) : (
            <>
              {PANTRY_CATEGORIES.map((category) => {
                const categoryItems = getCategoryItems(
                  filteredShoppingItems,
                  category
                );
                if (categoryItems.length === 0) return null;
                return (
                  <CategorySection
                    key={category}
                    title={category}
                    items={categoryItems}
                    onToggleItem={toggleItem}
                    onEditItem={handleEditItem}
                    showCheckbox={true}
                    showRecipe={true}
                  />
                );
              })}

              {getCheckedItems(filteredShoppingItems).length > 0 && (
                <CategorySection
                  title="Checked"
                  items={getCheckedItems(filteredShoppingItems)}
                  onToggleItem={toggleItem}
                  onEditItem={handleEditItem}
                  showCheckbox={true}
                  showRecipe={true}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
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
    marginTop: 8,
    gap: 16,
  },
});
