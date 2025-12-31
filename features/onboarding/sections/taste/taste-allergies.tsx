import { getThemeColors } from "@/constants/theme";
import { POPULAR_INGREDIENTS } from "@/lib/constants";
import {
  getIngredientInformation,
  searchIngredients,
  type Ingredient,
} from "@/lib/spoonacular";
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

const INGREDIENT_IMAGE_BASE_URL =
  "https://spoonacular.com/cdn/ingredients_100x100";

// Debounce delay for search - Spoonacular allows max 2 requests/second
const SEARCH_DEBOUNCE_MS = 800;

const createFallbackAllergyItem = (
  key: string
): AllergyItem & { _originalKey?: string } => {
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

// Helper function to safely extract ingredient display name
const getIngredientDisplayName = (item: AllergyItem): string => {
  // Check for name property on Ingredient type (from API)
  if ("name" in item && typeof item.name === "string" && item.name) {
    return item.name;
  }
  // Check for name on popular ingredients
  if ("name" in item && item.name) {
    return String(item.name);
  }
  // Fallback for unknown items
  return "Unknown Ingredient";
};

// Helper function to safely extract and format ingredient image URL
const getIngredientImageUrl = (item: AllergyItem): string | null => {
  // Check for image property on Ingredient type (from API)
  if ("image" in item && typeof item.image === "string" && item.image) {
    const imagePath = item.image;
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // Otherwise, construct the full URL
    return `${INGREDIENT_IMAGE_BASE_URL}/${imagePath}`;
  }
  return null;
};

export function TasteAllergies({
  title,
  description,
  onSelectionChange,
  initialSelection = [],
}: TasteAllergiesProps) {
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);

  const [selectedAllergiesMap, setSelectedAllergiesMap] = useState<
    Map<string, AllergyItem>
  >(new Map());
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
    const spoonacularId = (item as (typeof POPULAR_INGREDIENTS)[number])
      .spoonacularId;
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

  // Handle text change with debounce (800ms delay to respect Spoonacular rate limit)
  const handleSearchTextChange = useCallback(
    (query: string) => {
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

      // Debounce the API call - respects Spoonacular rate limit (max 2 req/sec)
      searchDebounceRef.current = setTimeout(() => {
        performSearch(query);
      }, SEARCH_DEBOUNCE_MS);
    },
    [performSearch]
  );

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

      setSelectedAllergiesMap((currentMap) => {
        const restoredMap = new Map<string, AllergyItem>();
        const unknownIds: string[] = [];

        // First pass: restore from current map, popular ingredients, or create fallback
        initialSelection.forEach((key) => {
          // First check if we already have this item in the current map (with full data)
          const existingItem = currentMap.get(key);
          if (existingItem && !("_originalKey" in existingItem)) {
            // We have the full item data, keep it
            restoredMap.set(key, existingItem);
            return;
          }

          // Check popular ingredients
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

        // Schedule async fetch for unknown IDs (outside state updater)
        if (unknownIds.length > 0) {
          fetchUnknownIngredients(unknownIds);
        }

        return restoredMap;
      });
    };

    const fetchUnknownIngredients = async (unknownIds: string[]) => {
      // Fetch ingredient info by ID directly from Spoonacular API
      for (const id of unknownIds) {
        try {
          const numericId = parseInt(id, 10);
          if (isNaN(numericId)) continue;

          const info = await getIngredientInformation(numericId);
          if (info && info.name) {
            const ingredientData: Ingredient = {
              id: numericId,
              name: info.name,
              image: (info as any).image || undefined,
            };
            setSelectedAllergiesMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(id, ingredientData);
              return newMap;
            });
          }
        } catch (error) {
          console.error(`Error fetching ingredient ${id}:`, error);
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
    const ingredientName = getIngredientDisplayName(item);
    const ingredientImageUrl = getIngredientImageUrl(item);

    return (
      <Pressable
        onPress={() => toggleAllergy(item)}
        style={[
          styles.allergyItem,
          { backgroundColor: Colors.background.surface },
        ]}
      >
        <View
          style={[styles.imageContainer, { backgroundColor: Colors.gray[100] }]}
        >
          {ingredientImageUrl ? (
            <Image
              source={{ uri: ingredientImageUrl }}
              style={styles.allergyIcon}
            />
          ) : (
            <MaterialCommunityIcons
              name="food-apple-outline"
              size={24}
              color={Colors.gray[400]}
            />
          )}
        </View>
        <Text
          style={[styles.allergyLabel, { color: Colors.text.primary }]}
          numberOfLines={2}
        >
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
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: Colors.background.surface,
            shadowColor: Colors.card.shadow,
            borderColor: Colors.border.light,
          },
        ]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.cardIconContainer,
              {
                backgroundColor: isDark
                  ? Colors.lilac[900] + "40"
                  : Colors.lilac[100],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="shield-alert-outline"
              size={40}
              color={isDark ? Colors.lilac[300] : Colors.lilac[900]}
            />
          </View>
          <Text style={[styles.cardTitle, { color: Colors.text.primary }]}>
            {title}
          </Text>
          <Text style={[styles.cardSubtitle, { color: Colors.text.secondary }]}>
            {description || "Select any allergies you have"}
          </Text>
        </View>

        <View style={styles.cardBody}>
          {/* Search Bar */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: isDark
                  ? Colors.background.tertiary
                  : Colors.background.secondary,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={Colors.text.secondary}
            />
            <TextInput
              style={[styles.searchInput, { color: Colors.text.primary }]}
              placeholder="Search ingredients..."
              placeholderTextColor={Colors.text.secondary}
              value={searchQuery}
              onChangeText={handleSearchTextChange}
            />
            {isSearching && (
              <ActivityIndicator size="small" color={Colors.lilac[900]} />
            )}
            {searchQuery.length > 0 && !isSearching && (
              <Pressable onPress={clearSearch}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color={Colors.text.secondary}
                />
              </Pressable>
            )}
          </View>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <View style={styles.selectedSection}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIconContainer,
                    {
                      backgroundColor: isDark
                        ? "rgba(239, 68, 68, 0.2)"
                        : "#EF444415",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={16}
                    color="#EF4444"
                  />
                </View>
                <Text
                  style={[styles.sectionTitle, { color: Colors.text.primary }]}
                >
                  Avoiding ({selectedItems.length})
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedChipsContainer}
              >
                {selectedItems.map((item, index) => {
                  const ingredientName = getIngredientDisplayName(item);
                  const ingredientImageUrl = getIngredientImageUrl(item);
                  return (
                    <Pressable
                      key={`selected-${index}`}
                      onPress={() => toggleAllergy(item)}
                      style={[
                        styles.selectedChip,
                        {
                          backgroundColor: isDark
                            ? "rgba(239, 68, 68, 0.15)"
                            : "#FEF2F2",
                          borderColor: isDark
                            ? "rgba(239, 68, 68, 0.3)"
                            : "#FECACA",
                        },
                      ]}
                    >
                      {ingredientImageUrl ? (
                        <Image
                          source={{ uri: ingredientImageUrl }}
                          style={styles.selectedChipImage}
                        />
                      ) : (
                        <View
                          style={[
                            styles.selectedChipImagePlaceholder,
                            {
                              backgroundColor: isDark
                                ? "rgba(239, 68, 68, 0.2)"
                                : "#FEE2E2",
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="food-off"
                            size={14}
                            color="#EF4444"
                          />
                        </View>
                      )}
                      <Text
                        style={[
                          styles.selectedChipLabel,
                          { color: isDark ? "#FCA5A5" : "#DC2626" },
                        ]}
                        numberOfLines={1}
                      >
                        {ingredientName}
                      </Text>
                      <View style={styles.removeIcon}>
                        <MaterialCommunityIcons
                          name="close"
                          size={12}
                          color="#FFFFFF"
                        />
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
              <View
                style={[
                  styles.sectionIconContainer,
                  {
                    backgroundColor: isDark
                      ? Colors.lilac[900] + "40"
                      : `${Colors.lilac[900]}15`,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="food-variant"
                  size={16}
                  color={isDark ? Colors.lilac[300] : Colors.lilac[900]}
                />
              </View>
              <Text
                style={[styles.sectionTitle, { color: Colors.text.primary }]}
              >
                {hasSearched ? "Search Results" : "Common Ingredients"}
              </Text>
            </View>

            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.lilac[900]} />
                <Text
                  style={[styles.loadingText, { color: Colors.text.secondary }]}
                >
                  Searching...
                </Text>
              </View>
            ) : hasSearched && displayItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="magnify-close"
                  size={48}
                  color={Colors.gray[300]}
                />
                <Text
                  style={[styles.emptyText, { color: Colors.text.secondary }]}
                >
                  No ingredients found
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: Colors.text.tertiary }]}
                >
                  Try a different search term
                </Text>
              </View>
            ) : (
              <FlatList
                data={unselectedItems}
                renderItem={renderAllergyItem}
                keyExtractor={(item, index) =>
                  `item-${index}-${getIngredientKey(item)}`
                }
                numColumns={3}
                scrollEnabled={false}
                contentContainerStyle={styles.gridContent}
                columnWrapperStyle={styles.gridRow}
              />
            )}
          </View>
        </View>

        {/* Skip Actions */}
        <View
          style={[
            styles.actionContainer,
            { borderTopColor: Colors.border.light },
          ]}
        >
          <Pressable
            style={[
              styles.skipButton,
              {
                backgroundColor: isDark
                  ? Colors.background.tertiary
                  : "#F5F5F5",
              },
            ]}
            onPress={() => {
              setSelectedAllergiesMap(new Map());
              onSelectionChange?.([]);
            }}
          >
            <Text
              style={[styles.skipButtonText, { color: Colors.text.primary }]}
            >
              I have no allergies
            </Text>
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
  cardIconContainer: {
    marginBottom: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
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
