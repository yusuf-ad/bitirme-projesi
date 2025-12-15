import { getThemeColors } from "@/constants/theme";
import { POPULAR_INGREDIENTS } from "@/lib/constants";
import { searchIngredients, type Ingredient } from "@/lib/spoonacular";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface TasteAllergiesProps {
  title: string;
  description?: string;
  onSelectionChange?: (selectedAllergies: string[]) => void;
  initialSelection?: string[];
}

type AllergyItem =
  | Ingredient
  | (typeof POPULAR_INGREDIENTS)[number]
  | { name: string; image?: string };

const INGREDIENT_IMAGE_BASE_URL = "https://spoonacular.com/cdn/ingredients_100x100";

const createFallbackAllergyItem = (key: string): AllergyItem & { _originalKey?: string } => {
  if (key.startsWith("name-")) {
    const formatted = key
      .replace("name-", "")
      .split("-")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
    return { name: formatted, _originalKey: key };
  }
  // For numeric IDs, show as "Item #ID" - will be replaced when found in search
  if (/^\d+$/.test(key)) {
    return { name: `Item #${key}`, _originalKey: key };
  }
  return { name: key, _originalKey: key };
};

export function TasteAllergies({
  title,
  description,
  onSelectionChange,
  initialSelection = [],
}: TasteAllergiesProps) {
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);

  const [selectedAllergiesMap, setSelectedAllergiesMap] = useState<Map<string, AllergyItem>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Debounce timer ref
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getIngredientKey = useCallback((item: AllergyItem) => {
    // Check for _originalKey first (for fallback items)
    if ("_originalKey" in item && (item as any)._originalKey) {
      return (item as any)._originalKey;
    }
    if ("id" in item && typeof item.id === "number") {
      return `${item.id}`;
    }
    const spoonacularId = (item as (typeof POPULAR_INGREDIENTS)[number]).spoonacularId;
    if (typeof spoonacularId === "number") {
      return `${spoonacularId}`;
    }
    return `name-${(item as any).name?.toLowerCase?.() ?? "unknown"}`;
  }, []);

  // Perform actual API search
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length === 0) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    try {
      setIsSearching(true);
      const { ingredients } = await searchIngredients(query, 0, 20);
      setSearchResults(ingredients);
      setHasSearched(true);
    } catch (error) {
      console.error("Error searching ingredients:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle text change with debounce (500ms delay)
  const handleSearchTextChange = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Clear previous timer
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    // If empty, reset immediately
    if (query.trim().length === 0) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }
    
    // Set searching state for UI feedback
    setIsSearching(true);
    
    // Debounce the API call - wait 500ms after user stops typing
    searchDebounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 500);
  }, [performSearch]);

  // Clear search function
  const clearSearch = useCallback(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setIsSearching(false);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadInitialSelection = async () => {
      if (initialSelection.length === 0) {
        setSelectedAllergiesMap(new Map());
        return;
      }

      const restoredMap = new Map<string, AllergyItem>();
      const unknownIds: string[] = [];

      // First pass: restore from previous map or popular ingredients
      initialSelection.forEach((key) => {
        const fromPopular = POPULAR_INGREDIENTS.find(
          (ingredient) => getIngredientKey(ingredient) === key
        );
        if (fromPopular) {
          restoredMap.set(key, fromPopular);
        } else if (/^\d+$/.test(key)) {
          // Numeric ID - need to look up
          unknownIds.push(key);
          restoredMap.set(key, createFallbackAllergyItem(key));
        } else {
          restoredMap.set(key, createFallbackAllergyItem(key));
        }
      });

      setSelectedAllergiesMap(restoredMap);

      // Try to fetch names for unknown numeric IDs
      if (unknownIds.length > 0) {
        try {
          // Search for each unknown ID to get its name
          for (const id of unknownIds) {
            const { ingredients } = await searchIngredients(id, 0, 5);
            const found = ingredients.find((ing) => `${ing.id}` === id);
            if (found) {
              setSelectedAllergiesMap((prev) => {
                const newMap = new Map(prev);
                newMap.set(id, found);
                return newMap;
              });
            }
          }
        } catch (error) {
          console.error("Error fetching ingredient names:", error);
        }
      }
    };

    loadInitialSelection();
  }, [initialSelection, getIngredientKey]);

  const toggleAllergy = (item: AllergyItem) => {
    const key = getIngredientKey(item);
    const isCurrentlySelected = selectedAllergiesMap.has(key);
    const newMap = new Map(selectedAllergiesMap);
    
    if (isCurrentlySelected) {
      newMap.delete(key);
    } else {
      newMap.set(key, item);
    }
    
    setSelectedAllergiesMap(newMap);
    onSelectionChange?.(Array.from(newMap.keys()));
  };

  const displayItems = hasSearched ? searchResults : POPULAR_INGREDIENTS;
  const selectedItems = Array.from(selectedAllergiesMap.values());
  const unselectedItems = displayItems.filter(
    (item) => !selectedAllergiesMap.has(getIngredientKey(item))
  );

  const renderAllergyItem = ({ item }: { item: AllergyItem }) => {
    const ingredientName = (item as any).name;
    const ingredientImage = (item as any).image;

    return (
      <Pressable
        onPress={() => toggleAllergy(item)}
        style={[styles.allergyItem, { backgroundColor: Colors.background.surface }]}
      >
        <View style={[styles.imageContainer, { backgroundColor: Colors.gray[100] }]}>
          {ingredientImage ? (
            <Image
              source={{ uri: `${INGREDIENT_IMAGE_BASE_URL}/${ingredientImage}` }}
              style={styles.allergyIcon}
            />
          ) : (
            <MaterialCommunityIcons name="food-apple-outline" size={24} color={Colors.gray[400]} />
          )}
        </View>
        <Text style={[styles.allergyLabel, { color: Colors.text.primary }]} numberOfLines={2}>
          {ingredientName}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.cardContainer, { backgroundColor: "#FFFFFF", shadowColor: Colors.lilac[900] }]}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Text style={[styles.cardEmoji, { backgroundColor: Colors.lilac[100] }]}>🥜</Text>
          <Text style={[styles.cardTitle, { color: Colors.text.primary }]}>{title}</Text>
          <Text style={[styles.cardSubtitle, { color: Colors.text.secondary }]}>
            {description || "Select any allergies you have"}
          </Text>
        </View>

        <View style={styles.cardBody}>
          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: Colors.background.surface }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.text.secondary} />
            <TextInput
              style={[styles.searchInput, { color: Colors.text.primary }]}
              placeholder="Search ingredients..."
              placeholderTextColor={Colors.text.secondary}
              value={searchQuery}
              onChangeText={handleSearchTextChange}
            />
            {isSearching && <ActivityIndicator size="small" color={Colors.lilac[900]} />}
            {searchQuery.length > 0 && !isSearching && (
              <Pressable onPress={clearSearch}>
                <MaterialCommunityIcons name="close-circle" size={20} color={Colors.text.secondary} />
              </Pressable>
            )}
          </View>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <View style={styles.selectedSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: "#EF444415" }]}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#EF4444" />
                </View>
                <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>
                  Avoiding ({selectedItems.length})
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedChipsContainer}
              >
                {selectedItems.map((item, index) => {
                  const ingredientName = (item as any).name;
                  const ingredientImage = (item as any).image;
                  return (
                    <Pressable
                      key={`selected-${index}`}
                      onPress={() => toggleAllergy(item)}
                      style={styles.selectedChip}
                    >
                      {ingredientImage ? (
                        <Image
                          source={{ uri: `${INGREDIENT_IMAGE_BASE_URL}/${ingredientImage}` }}
                          style={styles.selectedChipImage}
                        />
                      ) : (
                        <View style={styles.selectedChipImagePlaceholder}>
                          <MaterialCommunityIcons name="food-off" size={14} color="#EF4444" />
                        </View>
                      )}
                      <Text style={styles.selectedChipLabel} numberOfLines={1}>
                        {ingredientName}
                      </Text>
                      <View style={styles.removeIcon}>
                        <MaterialCommunityIcons name="close" size={12} color="#FFFFFF" />
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Available Items */}
          <View style={styles.availableSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: `${Colors.lilac[900]}15` }]}>
                <MaterialCommunityIcons name="food-variant" size={16} color={Colors.lilac[900]} />
              </View>
              <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>
                {hasSearched ? "Search Results" : "Common Ingredients"}
              </Text>
            </View>

            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.lilac[900]} />
                <Text style={[styles.loadingText, { color: Colors.text.secondary }]}>Searching...</Text>
              </View>
            ) : hasSearched && displayItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="magnify-close" size={48} color={Colors.gray[300]} />
                <Text style={[styles.emptyText, { color: Colors.text.secondary }]}>No ingredients found</Text>
                <Text style={[styles.emptySubtext, { color: Colors.text.tertiary }]}>Try a different search term</Text>
              </View>
            ) : (
              <FlatList
                data={unselectedItems}
                renderItem={renderAllergyItem}
                keyExtractor={(item, index) => `item-${index}-${getIngredientKey(item)}`}
                numColumns={3}
                scrollEnabled={false}
                contentContainerStyle={styles.gridContent}
                columnWrapperStyle={styles.gridRow}
              />
            )}
          </View>
        </View>

        {/* Skip Actions */}
        <View style={styles.actionContainer}>
          <Pressable
            style={styles.skipButton}
            onPress={() => {
              setSelectedAllergiesMap(new Map());
              onSelectionChange?.([]);
            }}
          >
            <Text style={[styles.skipButtonText, { color: Colors.text.secondary }]}>I have no allergies</Text>
          </Pressable>
        </View>
      </View>
      
      {/* Bottom Padding */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
    minHeight: "100%",
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    width: "100%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: 16,
    width: 80,
    height: 80,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 80,
    borderRadius: 40,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    minHeight: 48,
  },
  cardBody: {
    paddingBottom: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  selectedSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  selectedChipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 10,
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
  },
  selectedChipImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  selectedChipImagePlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedChipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#DC2626",
    maxWidth: 100,
  },
  removeIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  availableSection: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  gridRow: {
    gap: 10,
  },
  allergyItem: {
    flex: 1,
    maxWidth: "31%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  allergyIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  allergyLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 13,
  },
  actionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 8,
  },
  skipButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

