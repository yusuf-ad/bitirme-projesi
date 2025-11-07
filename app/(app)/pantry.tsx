import { Colors } from "@/constants/theme";
import {
  AddNewHeader,
  CategorySection,
  PantryItem,
  TabSwitcher,
  TabType,
} from "@/features/pantry";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PantryTab() {
  const [activeTab, setActiveTab] = useState<TabType>("pantry");
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  // Pantry stock items (items at home)
  const [pantryStockItems, setPantryStockItems] = useState<PantryItem[]>([
    {
      id: "p1",
      name: "Milk",
      amount: "1 liter",
      recipe: "",
      checked: false,
      category: "dairy",
    },
    {
      id: "p2",
      name: "Butter",
      amount: "200g",
      recipe: "",
      checked: false,
      category: "dairy",
    },
    {
      id: "p3",
      name: "Cheddar cheese",
      amount: "300g",
      recipe: "",
      checked: false,
      category: "dairy",
    },
    {
      id: "p4",
      name: "Chicken breast",
      amount: "500g",
      recipe: "",
      checked: false,
      category: "meat",
    },
    {
      id: "p5",
      name: "Ground beef",
      amount: "400g",
      recipe: "",
      checked: false,
      category: "meat",
    },
    {
      id: "p6",
      name: "Onions",
      amount: "3 pieces",
      recipe: "",
      checked: false,
      category: "produce",
    },
    {
      id: "p7",
      name: "Garlic",
      amount: "1 bulb",
      recipe: "",
      checked: false,
      category: "produce",
    },
    {
      id: "p8",
      name: "Potatoes",
      amount: "1kg",
      recipe: "",
      checked: false,
      category: "produce",
    },
    {
      id: "p9",
      name: "Olive oil",
      amount: "500ml",
      recipe: "",
      checked: false,
      category: "other",
    },
    {
      id: "p10",
      name: "Salt",
      amount: "",
      recipe: "",
      checked: false,
      category: "other",
    },
    {
      id: "p11",
      name: "Black pepper",
      amount: "",
      recipe: "",
      checked: false,
      category: "other",
    },
    {
      id: "p12",
      name: "All-purpose flour",
      amount: "1kg",
      recipe: "",
      checked: false,
      category: "other",
    },
    {
      id: "p13",
      name: "Rice",
      amount: "2kg",
      recipe: "",
      checked: false,
      category: "other",
    },
  ]);

  // Groceries shopping list (items to buy)
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([
    {
      id: "1",
      name: "Eggs",
      amount: "",
      recipe: "",
      checked: false,
      category: "dairy",
    },
    {
      id: "2",
      name: "1 1/2 cups/375ml milk",
      amount: "",
      recipe: "Pancakes",
      checked: false,
      category: "dairy",
    },
    {
      id: "3",
      name: "3 eggs",
      amount: "",
      recipe: "Pancakes",
      checked: false,
      category: "dairy",
    },
    {
      id: "4",
      name: "400g / 14oz beef mince",
      amount: "",
      recipe: "EASY SPAGHETTI BOLOGNESE",
      checked: false,
      category: "meat",
    },
    {
      id: "5",
      name: "1 onion, diced",
      amount: "",
      recipe: "EASY SPAGHETTI BOLOGNESE",
      checked: false,
      category: "produce",
    },
    {
      id: "6",
      name: "100g/3½oz carrot, grated",
      amount: "",
      recipe: "EASY SPAGHETTI BOLOGNESE",
      checked: false,
      category: "produce",
    },
    {
      id: "7",
      name: "salt and pepper",
      amount: "",
      recipe: "EASY SPAGHETTI BOLOGNESE",
      checked: false,
      category: "produce",
    },
    {
      id: "8",
      name: "1 tablespoon caster sugar",
      amount: "",
      recipe: "Pancakes",
      checked: true,
      category: "other",
    },
    {
      id: "9",
      name: "Oil",
      amount: "",
      recipe: "",
      checked: true,
      category: "other",
    },
    {
      id: "10",
      name: "3 teaspoons baking powder",
      amount: "",
      recipe: "Pancakes",
      checked: true,
      category: "other",
    },
    {
      id: "11",
      name: "3 cups/375g all-purpose flour",
      amount: "",
      recipe: "Pancakes",
      checked: true,
      category: "other",
    },
    {
      id: "12",
      name: "2 garlic cloves, chopped",
      amount: "",
      recipe: "EASY SPAGHETTI BOLOGNESE",
      checked: true,
      category: "produce",
    },
    {
      id: "13",
      name: "2 tbsp olive oil",
      amount: "",
      recipe: "EASY SPAGHETTI BOLOGNESE",
      checked: true,
      category: "other",
    },
  ]);

  const toggleItem = (id: string) => {
    if (activeTab === "groceries") {
      const item = pantryItems.find((i) => i.id === id);
      if (item && !item.checked) {
        // Item being checked - transfer to pantry
        setPantryStockItems((prev) => [...prev, { ...item, checked: false }]);
        setPantryItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        // Item being unchecked in "Checked" section
        setPantryItems((items) =>
          items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
        );
      }
    } else {
      // Pantry: toggle to mark as used/available
      setPantryStockItems((items) =>
        items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
      );
    }
  };

  const getCategoryItems = (category: string) => {
    const items = activeTab === "pantry" ? pantryStockItems : pantryItems;
    return items.filter((item) => !item.checked && item.category === category);
  };

  const getCheckedItems = () => {
    const items = activeTab === "pantry" ? pantryStockItems : pantryItems;
    return items.filter((item) => item.checked);
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header - Fixed */}
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      <View style={styles.searchContainer}>
        <AddNewHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAdd={handleAddNew}
          onStarPress={handleStarPress}
        />
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
          <CategorySection
            title="Dairy"
            items={getCategoryItems("dairy")}
            onToggleItem={toggleItem}
            onEditItem={handleEditItem}
            showCheckbox={activeTab === "groceries"}
            showRecipe={activeTab === "groceries"}
          />

          <CategorySection
            title="Meat"
            items={getCategoryItems("meat")}
            onToggleItem={toggleItem}
            onEditItem={handleEditItem}
            showCheckbox={activeTab === "groceries"}
            showRecipe={activeTab === "groceries"}
          />

          <CategorySection
            title="Produce"
            items={getCategoryItems("produce")}
            onToggleItem={toggleItem}
            onEditItem={handleEditItem}
            showCheckbox={activeTab === "groceries"}
            showRecipe={activeTab === "groceries"}
          />

          <CategorySection
            title="Other"
            items={getCategoryItems("other")}
            onToggleItem={toggleItem}
            onEditItem={handleEditItem}
            showCheckbox={activeTab === "groceries"}
            showRecipe={activeTab === "groceries"}
          />

          {activeTab === "groceries" && (
            <CategorySection
              title="Checked"
              items={getCheckedItems()}
              onToggleItem={toggleItem}
              onEditItem={handleEditItem}
              showCheckbox={true}
              showRecipe={true}
            />
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
  },
});
