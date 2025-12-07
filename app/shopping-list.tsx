import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { Colors } from "@/constants/theme";
import {
  CategorySection,
  PantryItem,
  PantryItemDetailSheet,
} from "@/features/pantry";
import { pantryService } from "@/features/pantry/services/pantry-service";
import { PANTRY_CATEGORIES } from "@/lib/constants";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ShoppingListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMovingToPantry, setIsMovingToPantry] = useState(false);
  const hasCheckedItems = useRef(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedItem, setSelectedItem] = useState<PantryItem | null>(null);

  console.log(items);

  const fetchItems = async () => {
    try {
      const data = await pantryService.getItems("shopping_list");
      setItems(data);
      // Track if there are any checked items
      hasCheckedItems.current = data.some((item) => item.checked);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sayfadan çıkıldığında tiklenen öğeleri pantry'e taşı
  const moveCheckedToPantry = useCallback(async () => {
    if (!hasCheckedItems.current) return;

    try {
      const { movedCount, error } =
        await pantryService.moveCheckedItemsToPantry();
      if (error) {
        console.error("Error moving items:", error);
      } else if (movedCount > 0) {
        console.log(`${movedCount} item(s) moved to pantry`);
      }
    } catch (error) {
      console.error("Failed to move items to pantry:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();

      // Cleanup: sayfa blur olduğunda tiklenen öğeleri pantry'e taşı
      return () => {
        moveCheckedToPantry();
      };
    }, [moveCheckedToPantry])
  );

  const shoppingListItems = items.filter((i) => i.status === "shopping_list");
  const checkedItems = shoppingListItems.filter((i) => i.checked);
  const uncheckedItems = shoppingListItems.filter((i) => !i.checked);

  const toggleItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newChecked = !item.checked;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: newChecked } : i))
    );

    // Track checked state
    hasCheckedItems.current = items.some((i) =>
      i.id === id ? newChecked : i.checked
    );

    try {
      await pantryService.updateItem(id, { checked: newChecked });
    } catch (error) {
      console.error("Failed to update item", error);
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: !newChecked } : i))
      );
      hasCheckedItems.current = items.some((i) =>
        i.id === id ? !newChecked : i.checked
      );
    }
  };

  const handleBackPress = async () => {
    // Geri gitmeden önce tiklenen öğeleri pantry'e taşı
    if (checkedItems.length > 0) {
      setIsMovingToPantry(true);
      try {
        const { movedCount } = await pantryService.moveCheckedItemsToPantry();
        if (movedCount > 0) {
          setIsMovingToPantry(false);
          Alert.alert(
            "Pantry Updated",
            `${movedCount} item${
              movedCount > 1 ? "s" : ""
            } added to your pantry.`,
            [{ text: "OK", onPress: () => router.back() }]
          );
          return;
        }
      } catch (error) {
        console.error("Failed to move items:", error);
        setIsMovingToPantry(false);
      }
    }
    router.back();
  };

  const getCategoryItems = (itemsList: PantryItem[], category: string) => {
    return itemsList.filter((item) => item.category === category);
  };

  const handleEditItem = (id: string) => {
    const item = items.find((i) => i.id === id) || null;
    setSelectedItem(item);
    bottomSheetRef.current?.present();
  };

  const handleUpdateItem = async (id: string, updates: Partial<PantryItem>) => {
    try {
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem((prev) => (prev ? { ...prev, ...updates } : null));
      }
      await pantryService.updateItem(id, updates);
      await fetchItems();
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      bottomSheetRef.current?.dismiss();
      await pantryService.deleteItem(id);
      await fetchItems();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleMarkAll = async () => {
    if (items.length === 0) return;

    // Optimistic update
    const previousItems = [...items];
    setItems((prev) =>
      prev.map((i) =>
        i.status === "shopping_list" ? { ...i, checked: true } : i
      )
    );

    hasCheckedItems.current = true;

    try {
      await pantryService.markAllAsChecked();
    } catch (error) {
      console.error("Failed to mark all as checked", error);
      // Revert on error
      setItems(previousItems);
      hasCheckedItems.current = previousItems.some((item) => item.checked);
    }
  };

  if (isMovingToPantry) {
    return (
      <ProfessionalLoadingScreen
        title="Updating Pantry"
        subtitle="Moving checked items to your pantry..."
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Groceries</Text>
        {items.length !== 0 ? (
          <Pressable hitSlop={24} onPress={handleMarkAll}>
            <Text
              style={{
                color: Colors.lilac[900],
                fontWeight: "bold",
              }}
            >
              Mark all
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* Summary bar */}
      {shoppingListItems.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {uncheckedItems.length} to buy • {checkedItems.length} done
          </Text>
          {checkedItems.length > 0 && (
            <Text style={styles.summaryHint}>
              Items will be added to pantry when you leave
            </Text>
          )}
        </View>
      )}

      {isLoading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.lilac[900]} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          {shoppingListItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather
                name="shopping-cart"
                size={48}
                color={Colors.gray[400]}
              />
              <Text style={styles.emptyText}>Your shopping list is empty</Text>
            </View>
          ) : (
            <>
              {PANTRY_CATEGORIES.map((category) => {
                const categoryItems = getCategoryItems(
                  uncheckedItems,
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

              {checkedItems.length > 0 && (
                <CategorySection
                  title="Checked"
                  items={checkedItems}
                  onToggleItem={toggleItem}
                  onEditItem={handleEditItem}
                  showCheckbox={true}
                  showRecipe={true}
                />
              )}
            </>
          )}
        </ScrollView>
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
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: Colors.background.secondary,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray[500],
  },
  summaryBar: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  summaryHint: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
});
