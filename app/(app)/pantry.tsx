import { Colors } from "@/constants/theme";
import {
  AddNewHeader,
  CategorySection,
  PantryCategoryPreview,
  PantryItem,
  SearchPantryHeader,
  TabSwitcher,
  TabType,
} from "@/features/pantry";
import { pantryService } from "@/features/pantry/services/pantry-service";
import { PANTRY_CATEGORIES } from "@/lib/constants";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PantryTab() {
  const [activeTab, setActiveTab] = useState<TabType>("pantry");
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const data = await pantryService.getAllItems();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

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

  const handleAddNew = () => {
    // TODO: Implement add new item functionality
    console.log("Add new item:", searchQuery);
  };

  const handleStarPress = () => {
    // TODO: Implement starred items functionality
    console.log("Star pressed");
  };

  const handleEditItem = (id: string) => {
    // TODO: Implement edit item functionality
    console.log("Edit item:", id);
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.lilac[600]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header - Fixed */}
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      <View style={styles.searchContainer}>
        {activeTab === "pantry" ? (
          <SearchPantryHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAddNew}
            onStarPress={handleStarPress}
          />
        ) : (
          <AddNewHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAddNew}
            onStarPress={handleStarPress}
          />
        )}
      </View>

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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[200],
    shadowColor: Colors.background.secondary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
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
});
