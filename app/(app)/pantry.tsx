import { Colors } from "@/constants/theme";
import { ErrorState, LoadingState, RecipeGrid } from "@/features/home";
import {
  EmptyPantryState,
  PantryCategory,
  PantryCategoryPreview,
  PantryItem,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MEAL_TYPES = ["All", "Breakfast", "Lunch", "Dinner", "Snack"];

export default function PantryTab() {
  const [activeTab, setActiveTab] = useState<TabType>("my-ingredients");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("All");
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
          {activeTab === "my-ingredients" ? (
            pantryStockItems.length === 0 && !searchQuery ? (
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
            )
          ) : (
            <View style={styles.recipeIdeasContainer}>
              {pantryStockItems.length === 0 ? (
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderText}>
                    Add items to your pantry to see recipe ideas.
                  </Text>
                </View>
              ) : (
                <>
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
                            selectedMealType === type &&
                              styles.filterChipActive,
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
                    {!isLoadingRecipes && !recipeError && (
                      <Text style={styles.resultsText}>
                        You can make {totalCount} recipes
                      </Text>
                    )}
                  </View>

                  {isLoadingRecipes ? (
                    <LoadingState />
                  ) : recipeError ? (
                    <ErrorState onRetry={refetchRecipes} />
                  ) : (
                    <RecipeGrid recipes={recipeIdeas || []} />
                  )}
                </>
              )}
            </View>
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
