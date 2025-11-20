import { Colors } from "@/constants/theme";
import { CategorySection, PantryItem } from "@/features/pantry";
import { pantryService } from "@/features/pantry/services/pantry-service";
import { PANTRY_CATEGORIES } from "@/lib/constants";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MOCK_ITEMS: PantryItem[] = [
  {
    id: "mock-1",
    user_id: "mock-user",
    name: "Bananas",
    amount: 1,
    unit: "bunch",
    is_weight: false,
    category: "Fruits & Vegetables",
    status: "shopping_list",
    checked: false,
  },
  {
    id: "mock-2",
    user_id: "mock-user",
    name: "Milk",
    amount: 1,
    unit: "gallon",
    is_weight: false,
    category: "Dairy",
    status: "shopping_list",
    checked: false,
  },
  {
    id: "mock-3",
    user_id: "mock-user",
    name: "Eggs",
    amount: 12,
    unit: "count",
    is_weight: false,
    category: "Dairy",
    status: "shopping_list",
    checked: false,
  },
  {
    id: "mock-4",
    user_id: "mock-user",
    name: "Bread",
    amount: 1,
    unit: "loaf",
    is_weight: false,
    category: "Bakery",
    status: "shopping_list",
    checked: false,
  },
  {
    id: "mock-5",
    user_id: "mock-user",
    name: "Chicken Breast",
    amount: 2,
    unit: "lbs",
    is_weight: true,
    category: "Meat & Seafood",
    status: "shopping_list",
    checked: false,
  },
  {
    id: "mock-6",
    user_id: "mock-user",
    name: "Rice",
    amount: 5,
    unit: "lbs",
    is_weight: true,
    category: "Pasta, Sauces & Grain",
    status: "shopping_list",
    checked: false,
  },
  {
    id: "mock-7",
    user_id: "mock-user",
    name: "Pasta Sauce",
    amount: 1,
    unit: "jar",
    is_weight: false,
    category: "Pasta, Sauces & Grain",
    status: "shopping_list",
    checked: false,
  },
  {
    id: "mock-8",
    user_id: "mock-user",
    name: "Cheddar Cheese",
    amount: 8,
    unit: "oz",
    is_weight: true,
    category: "Dairy",
    status: "shopping_list",
    checked: true,
  },
  {
    id: "mock-9",
    user_id: "mock-user",
    name: "Apples",
    amount: 6,
    unit: "count",
    is_weight: false,
    category: "Fruits & Vegetables",
    status: "shopping_list",
    checked: true,
  },
  {
    id: "mock-10",
    user_id: "mock-user",
    name: "Ground Beef",
    amount: 1,
    unit: "lb",
    is_weight: true,
    category: "Meat & Seafood",
    status: "shopping_list",
    checked: true,
  },
];

export default function ShoppingListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const data = await pantryService.getAllItems();
      setItems([...MOCK_ITEMS, ...data]);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      setItems(MOCK_ITEMS);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const shoppingListItems = items.filter((i) => i.status === "shopping_list");
  const checkedItems = shoppingListItems.filter((i) => i.checked);
  const uncheckedItems = shoppingListItems.filter((i) => !i.checked);

  const toggleItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newChecked = !item.checked;

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: newChecked } : i))
    );

    try {
      await pantryService.updateItem(id, { checked: newChecked });
    } catch (error) {
      console.error("Failed to update item", error);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: !newChecked } : i))
      );
    }
  };

  const getCategoryItems = (itemsList: PantryItem[], category: string) => {
    return itemsList.filter((item) => item.category === category);
  };

  const handleEditItem = (id: string) => {
    console.log("Edit item:", id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Groceries</Text>
        <View style={{ width: 24 }} />
      </View>

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
});
