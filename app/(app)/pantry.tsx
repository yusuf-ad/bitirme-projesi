import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabType = "groceries" | "pantry";

interface PantryItem {
  id: string;
  name: string;
  amount: string;
  recipe: string;
  checked: boolean;
  category: "dairy" | "meat" | "produce" | "other";
}

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

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 52 },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom },
        ]}
      >
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <View style={styles.tabSwitcher}>
            <Pressable
              onPress={() => setActiveTab("pantry")}
              style={[
                styles.tabButton,
                activeTab === "pantry" && styles.tabButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "pantry"
                    ? styles.activeTabText
                    : styles.inactiveTabText,
                ]}
              >
                Pantry
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("groceries")}
              style={[
                styles.tabButton,
                activeTab === "groceries" && styles.tabButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "groceries"
                    ? styles.activeTabText
                    : styles.inactiveTabText,
                ]}
              >
                Groceries
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {activeTab === "pantry" ? (
            <View>
              {/* Add New Header */}
              <View style={styles.addNewContainer}>
                <View style={styles.addNewHeader}>
                  <TextInput
                    style={styles.addNewInput}
                    placeholder="Add new"
                    placeholderTextColor={Colors.gray[300]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <Pressable style={styles.iconButton}>
                    <Feather name="plus" size={24} color={Colors.lilac[700]} />
                  </Pressable>
                </View>
                <Pressable style={styles.starButton}>
                  <Feather name="star" size={24} color={Colors.lilac[900]} />
                </Pressable>
              </View>

              {/* Dairy Section */}
              {getCategoryItems("dairy").length > 0 && (
                <View style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>Dairy</Text>
                  {getCategoryItems("dairy").map((item) => (
                    <PantryItemRow
                      key={item.id}
                      item={item}
                      onToggle={toggleItem}
                    />
                  ))}
                </View>
              )}

              {/* Meat Section */}
              {getCategoryItems("meat").length > 0 && (
                <View style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>Meat</Text>
                  {getCategoryItems("meat").map((item) => (
                    <PantryItemRow
                      key={item.id}
                      item={item}
                      onToggle={toggleItem}
                    />
                  ))}
                </View>
              )}

              {/* Produce Section */}
              {getCategoryItems("produce").length > 0 && (
                <View style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>Produce</Text>
                  {getCategoryItems("produce").map((item) => (
                    <PantryItemRow
                      key={item.id}
                      item={item}
                      onToggle={toggleItem}
                    />
                  ))}
                </View>
              )}

              {/* Checked Section */}
              {getCheckedItems().length > 0 && (
                <View style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>Checked</Text>
                  {getCheckedItems().map((item) => (
                    <PantryItemRow
                      key={item.id}
                      item={item}
                      onToggle={toggleItem}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.placeholderText}>Groceries content</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

interface PantryItemRowProps {
  item: PantryItem;
  onToggle: (id: string) => void;
}

function PantryItemRow({ item, onToggle }: PantryItemRowProps) {
  return (
    <Animated.View
      style={styles.itemRow}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.duration(200)}
    >
      <Pressable
        onPress={() => onToggle(item.id)}
        style={styles.checkboxContainer}
      >
        <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
          {item.checked && (
            <Feather name="check" size={18} color={Colors.lilac[900]} />
          )}
        </View>
      </Pressable>

      <View style={styles.itemContent}>
        <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
          {item.name}
        </Text>
        {item.recipe ? (
          <Text style={styles.itemRecipe}>{item.recipe}</Text>
        ) : null}
      </View>

      <Pressable style={styles.editButton}>
        <Feather name="edit-2" size={18} color={Colors.gray[300]} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  tabContainer: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: Colors.background.surface,
    borderRadius: 120,
    padding: 4,
    height: 48,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 120,
  },
  tabButtonActive: {
    backgroundColor: Colors.lilac[200], // #E1D9EE from Figma
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  activeTabText: {
    color: Colors.text.primary, // #000000
  },
  inactiveTabText: {
    color: Colors.gray[400], // #737780
  },
  content: {
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  // Add New Header
  addNewContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  addNewHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: Colors.lilac[100],
    borderRadius: 12,
  },
  addNewInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.purple[600],
    fontWeight: "400",
    paddingVertical: 0,
  },
  iconButton: {
    padding: 4,
  },
  starButton: {
    padding: 8,
  },
  // Category Section
  categorySection: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.lilac[900],
    marginBottom: 2,
    marginTop: 4,
  },
  // Item Row
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    gap: 8,
  },
  checkboxContainer: {
    padding: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.lilac[300],
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.surface,
  },
  checkboxChecked: {
    backgroundColor: Colors.lilac[100],
    borderColor: Colors.lilac[600],
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: 15,
    color: Colors.purple[800],
    fontWeight: "400",
    lineHeight: 20,
  },
  itemNameChecked: {
    color: Colors.gray[400],
    textDecorationLine: "line-through",
  },
  itemRecipe: {
    fontSize: 11,
    color: Colors.lilac[700],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  editButton: {
    padding: 6,
  },
});
