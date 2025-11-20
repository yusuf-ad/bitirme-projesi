import { Colors } from "@/constants/theme";
import { ErrorState, LoadingState, RecipeGrid } from "@/features/home";
import {
  EmptyPantryState,
  PantryCategory,
  PantryCategoryPreview,
  PantryItem,
<<<<<<< HEAD
  PantryScreenHeader,
  PantrySkeleton,
  TabType,
} from "@/features/pantry";
import { pantryService } from "@/features/pantry/services/pantry-service";
import { usePantryRecipesQuery } from "@/hooks/use-pantry-recipes-query";
import { PANTRY_CATEGORIES } from "@/lib/constants";
import { getCommonPantryIngredients } from "@/lib/spoonacular";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
=======
  ScannedItem,
  SearchPantryHeader,
  TabSwitcher,
  TabType,
} from "@/features/pantry";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
>>>>>>> parent of 3884a76 (Merge pull request #37 from yusuf-ad/yusuf)
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MEAL_TYPES = ["All", "Breakfast", "Lunch", "Dinner", "Snack"];

export default function PantryTab() {
  const [activeTab, setActiveTab] = useState<TabType>("my-ingredients");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("All");
  const insets = useSafeAreaInsets();

<<<<<<< HEAD
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
  const pantryStockItems = useMemo(
    () => items.filter((i) => i.status === "pantry"),
    [items]
  );
  const shoppingListCount = items.filter(
    (i) => i.status === "shopping_list"
  ).length;

  const ingredientNames = useMemo(
    () => pantryStockItems.map((i) => i.spoonacular_name || i.name),
    [pantryStockItems]
  );

  const {
    recipes: recipeIdeas,
    isLoading: isLoadingRecipes,
    error: recipeError,
    refetch: refetchRecipes,
    totalCount,
  } = usePantryRecipesQuery({
    ingredients: ingredientNames,
    enabled: activeTab === "recipe-ideas",
    type:
      selectedMealType === "All" ? undefined : selectedMealType.toLowerCase(),
  });

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

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.container}>
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
=======
  const [scannedItems] = useState<ScannedItem[]>([
    {
      isWeight: false,
      name: "tomato",
      parsedAmount: 5,
      parsedUnit: "pieces",
      quantity: "5 pieces",
      spoonacularId: 11529,
      spoonacularImage: "tomato.png",
      spoonacularName: "tomato",
    },
    {
      isWeight: false,
      name: "carrot",
      parsedAmount: 3,
      parsedUnit: "pieces",
      quantity: "3 pieces",
      spoonacularId: 11124,
      spoonacularImage: "sliced-carrot.png",
      spoonacularName: "carrot",
    },
    {
      isWeight: true,
      name: "broccoli",
      parsedAmount: 200,
      parsedUnit: "g",
      quantity: "200g",
      spoonacularId: 11090,
      spoonacularImage: "broccoli.jpg",
      spoonacularName: "broccoli",
    },
    {
      isWeight: false,
      name: "eggplant",
      parsedAmount: 1,
      parsedUnit: "piece",
      quantity: "1 piece",
      spoonacularId: 11209,
      spoonacularImage: "eggplant.png",
      spoonacularName: "eggplant",
    },
    {
      isWeight: true,
      name: "cabbage",
      parsedAmount: 200,
      parsedUnit: "g",
      quantity: "200g",
      spoonacularId: 11109,
      spoonacularImage: "cabbage.jpg",
      spoonacularName: "cabbage",
    },
    {
      isWeight: true,
      name: "lettuce",
      parsedAmount: 150,
      parsedUnit: "g",
      quantity: "150g",
      spoonacularId: 11252,
      spoonacularImage: "iceberg-lettuce.jpg",
      spoonacularName: "lettuce",
    },
    {
      isWeight: false,
      name: "yellow bell pepper",
      parsedAmount: 1,
      parsedUnit: "piece",
      quantity: "1 piece",
      spoonacularId: 11951,
      spoonacularImage: "yellow-bell-pepper.jpg",
      spoonacularName: "yellow pepper",
    },
    {
      isWeight: false,
      name: "red bell pepper",
      parsedAmount: 1,
      parsedUnit: "piece",
      quantity: "1 piece",
      spoonacularId: 11821,
      spoonacularImage: "red-pepper.jpg",
      spoonacularName: "red pepper",
    },
    {
      isWeight: false,
      name: "zucchini",
      parsedAmount: 2,
      parsedUnit: "pieces",
      quantity: "2 pieces",
      spoonacularId: 11477,
      spoonacularImage: "zucchini.jpg",
      spoonacularName: "zucchini",
    },
    {
      isWeight: false,
      name: "green onion",
      parsedAmount: 5,
      parsedUnit: "pieces",
      quantity: "5 pieces",
      spoonacularId: 11291,
      spoonacularImage: "spring-onions.jpg",
      spoonacularName: "spring onions",
    },
  ]);

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
>>>>>>> parent of 3884a76 (Merge pull request #37 from yusuf-ad/yusuf)

  return (
    <View style={styles.container}>
      <PantryScreenHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        shoppingListCount={shoppingListCount}
        ingredientsCount={pantryStockItems.length}
        recipeIdeasCount={totalCount || 0}
      />

<<<<<<< HEAD
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
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {pantryStockItems.length === 0 ? (
            <View
              style={[styles.categoriesContainer, { paddingHorizontal: 16 }]}
            >
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>
                  Add items to your pantry to see recipe ideas.
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
                <View style={styles.filtersWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                  >
                    {MEAL_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.filterChip,
                          selectedMealType === type && styles.filterChipActive,
                        ]}
                        onPress={() => setSelectedMealType(type)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            selectedMealType === type &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <ScrollView
                style={styles.contentScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.scrollContent,
                  {
                    paddingBottom: insets.bottom * 2 + 52,
                    paddingTop: 0,
                  },
                ]}
              >
                {isLoadingRecipes ? (
                  <LoadingState />
                ) : recipeError ? (
                  <ErrorState onRetry={refetchRecipes} />
                ) : (
                  <RecipeGrid recipes={recipeIdeas || []} />
                )}
              </ScrollView>
=======
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
              <PantryCategoryPreview title="All" items={scannedItems} />
              <PantryCategoryPreview
                title="Fruits & Vegetables"
                items={scannedItems}
              />
              {/* These are empty based on provided data, but structure supports them */}
              <PantryCategoryPreview title="Meat & Seafood" items={[]} />
              <PantryCategoryPreview title="Dairy" items={[]} />
            </>
          ) : (
            <>
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
>>>>>>> parent of 3884a76 (Merge pull request #37 from yusuf-ad/yusuf)
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
<<<<<<< HEAD
  center: {
    justifyContent: "center",
    alignItems: "center",
=======
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
>>>>>>> parent of 3884a76 (Merge pull request #37 from yusuf-ad/yusuf)
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
  placeholderContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    textAlign: "center",
    fontSize: 16,
    color: Colors.gray[500],
  },
  recipeIdeasContainer: {
    flex: 1,
    minHeight: 200,
  },
  filtersWrapper: {
    marginBottom: 16,
    gap: 12,
  },
  filtersContainer: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  filterChipActive: {
    backgroundColor: Colors.lilac[600],
    borderColor: Colors.lilac[600],
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: Colors.text.inverse,
  },
  resultsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
});
