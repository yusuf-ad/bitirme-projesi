import { Colors } from "@/constants/theme";
import {
  AddNewHeader,
  CategorySection,
  PantryItem,
  TabSwitcher,
  TabType,
} from "@/features/pantry";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PantryTab() {
  const [activeTab, setActiveTab] = useState<TabType>("pantry");
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

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
    setPantryItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const getCategoryItems = (category: string) => {
    return pantryItems.filter(
      (item) => !item.checked && item.category === category
    );
  };

  const getCheckedItems = () => {
    return pantryItems.filter((item) => item.checked);
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
    <ScrollView
      style={[styles.container, { paddingBottom: insets.bottom + 52 }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom * 2 + 52 },
      ]}
    >
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      <View style={styles.content}>
        {activeTab === "groceries" ? (
          <View>
            <AddNewHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAdd={handleAddNew}
              onStarPress={handleStarPress}
            />

            <CategorySection
              title="Dairy"
              items={getCategoryItems("dairy")}
              onToggleItem={toggleItem}
              onEditItem={handleEditItem}
            />

            <CategorySection
              title="Meat"
              items={getCategoryItems("meat")}
              onToggleItem={toggleItem}
              onEditItem={handleEditItem}
            />

            <CategorySection
              title="Produce"
              items={getCategoryItems("produce")}
              onToggleItem={toggleItem}
              onEditItem={handleEditItem}
            />

            <CategorySection
              title="Checked"
              items={getCheckedItems()}
              onToggleItem={toggleItem}
              onEditItem={handleEditItem}
            />
          </View>
        ) : (
          <Text style={styles.placeholderText}>Pantry content</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
