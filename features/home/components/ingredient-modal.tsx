import { Colors } from "@/constants/theme";
import { resolveAllergiesFast } from "@/lib/allergies-diet-helpers";
import { POPULAR_INGREDIENTS } from "@/lib/constants";
import { searchIngredients, type Ingredient } from "@/lib/spoonacular";
import { useOnboarding } from "@/providers/onboarding-provider";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface IngredientModalProps {
  onIngredientsSelect?: (ingredients: Ingredient[]) => void;
}

interface DisplayAllergy {
  id: string;
  name: string;
  image?: string;
  imageUrl?: string;
}

export const IngredientModal = forwardRef<
  BottomSheetModal,
  IngredientModalProps
>(({ onIngredientsSelect }, ref) => {
  const { top } = useSafeAreaInsets();
  const onboarding = useOnboarding();
  const [selectedIngredients, setSelectedIngredients] = useState<
    Map<string, Ingredient | (typeof POPULAR_INGREDIENTS)[0]>
  >(new Map());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [showAllergies, setShowAllergies] = useState<boolean>(false);
  const [userAllergies, setUserAllergies] = useState<DisplayAllergy[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const screenHeight =
    Dimensions.get("screen").height - top - (Platform.OS === "ios" ? 24 : 0);
  const INGREDIENT_IMAGE_BASE_URL =
    "https://spoonacular.com/cdn/ingredients_100x100";

  // Load user allergies when modal opens
  useEffect(() => {
    if (onboarding.selectedAllergies && onboarding.selectedAllergies.length > 0) {
      const allergies = resolveAllergiesFast(onboarding.selectedAllergies);
      setUserAllergies(allergies);
    }
  }, [onboarding.selectedAllergies]);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const getIngredientKey = useCallback(
    (item: Ingredient | (typeof POPULAR_INGREDIENTS)[0]) => {
      if ("id" in item && typeof item.id === "number") {
        return `${item.id}`;
      }

      const spoonacularId = (item as (typeof POPULAR_INGREDIENTS)[number])
        .spoonacularId;
      if (typeof spoonacularId === "number") {
        return `${spoonacularId}`;
      }

      return `name-${(item as any).name?.toLowerCase?.() ?? "unknown"}`;
    },
    []
  );

  const toggleIngredient = useCallback(
    (item: Ingredient | (typeof POPULAR_INGREDIENTS)[0]) => {
      const key = getIngredientKey(item);
      setSelectedIngredients((prev) => {
        const newMap = new Map(prev);
        if (newMap.has(key)) {
          newMap.delete(key);
        } else {
          newMap.set(key, item);
        }
        return newMap;
      });
    },
    [getIngredientKey]
  );

  const handleClearAll = useCallback(() => {
    setSelectedIngredients(new Map());
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length === 0) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
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

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If query is empty, clear immediately
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    // Set loading state immediately
    setIsSearching(true);

    // Debounce the search with 600ms delay to avoid rate limiting
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 600);

    // Cleanup on unmount or when query changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Selected items
  const selectedItems = useMemo(() => {
    return Array.from(selectedIngredients.values());
  }, [selectedIngredients]);

  // Check if ingredient contains allergens
  const containsAllergens = useCallback((ingredientName: string): boolean => {
    if (!userAllergies.length) return false;
    
    const lowerIngredientName = ingredientName.toLowerCase();
    return userAllergies.some(allergy =>
      lowerIngredientName.includes(allergy.name.toLowerCase())
    );
  }, [userAllergies]);

  // Display items - either search results or popular
  // Filter search results to exclude already selected items and allergens
  const displayItems = useMemo(() => {
    if (!hasSearched) {
      // Filter popular ingredients to exclude allergens
      return POPULAR_INGREDIENTS.filter(item => !containsAllergens(item.name));
    }
    // Filter out search results that are already selected or contain allergens
    return searchResults.filter(
      (item) => !selectedIngredients.has(getIngredientKey(item)) && !containsAllergens(item.name)
    );
  }, [hasSearched, searchResults, selectedIngredients, getIngredientKey, containsAllergens]);

  // Unselected items from display
  const unselectedItems = useMemo(() => {
    return displayItems.filter((item) => {
      const key = getIngredientKey(item);
      return !selectedIngredients.has(key);
    });
  }, [displayItems, selectedIngredients, getIngredientKey]);

  const handleApply = useCallback(() => {
    const ingredientsToSend: Ingredient[] = selectedItems.map((item) => {
      if ("id" in item && typeof item.id === "number") {
        return item as Ingredient;
      }

      const popularItem = item as (typeof POPULAR_INGREDIENTS)[number];
      return {
        id: popularItem.spoonacularId ?? 0,
        name: popularItem.name,
        image: popularItem.image,
      };
    });

    onIngredientsSelect?.(ingredientsToSend);
    if (typeof ref !== "function" && ref?.current?.dismiss) {
      ref.current.dismiss();
    }
  }, [selectedItems, onIngredientsSelect, ref]);

  const getItemName = (item: Ingredient | (typeof POPULAR_INGREDIENTS)[0]) => {
    return (item as any).name;
  };

  const getItemImage = (item: Ingredient | (typeof POPULAR_INGREDIENTS)[0]) => {
    return (item as any).image;
  };

  const renderIngredientItem = (
    item: Ingredient | (typeof POPULAR_INGREDIENTS)[0],
    isSelected: boolean
  ) => {
    const ingredientName = getItemName(item);
    const ingredientImage = getItemImage(item);
    const key = getIngredientKey(item);

    return (
      <Pressable
        key={`ingredient-${key}`}
        style={({ pressed }) => [
          styles.ingredientItem,
          isSelected && styles.ingredientItemSelectedPopular,
          pressed && { transform: [{ scale: 0.95 }] },
        ]}
        onPress={() => toggleIngredient(item)}
      >
        {ingredientImage ? (
          <Image
            source={{
              uri: `${INGREDIENT_IMAGE_BASE_URL}/${ingredientImage}`,
            }}
            style={[styles.ingredientCircle, isSelected && { opacity: 0.75 }]}
          />
        ) : (
          <View style={styles.ingredientCircle} />
        )}
        <Text style={[styles.ingredientText, isSelected && { opacity: 0.75 }]}>
          {ingredientName}
        </Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        )}
      </Pressable>
    );
  };

  const renderSelectedIngredientItem = (
    item: Ingredient | (typeof POPULAR_INGREDIENTS)[0]
  ) => {
    const ingredientName = getItemName(item);
    const ingredientImage = getItemImage(item);
    const key = getIngredientKey(item);

    return (
      <Pressable
        key={`selected-${key}`}
        style={({ pressed }) => [
          styles.ingredientItem,
          styles.ingredientItemSelected,
          pressed && { transform: [{ scale: 0.95 }] },
        ]}
        onPress={() => toggleIngredient(item)}
      >
        {ingredientImage ? (
          <Image
            source={{
              uri: `${INGREDIENT_IMAGE_BASE_URL}/${ingredientImage}`,
            }}
            style={styles.ingredientCircle}
          />
        ) : (
          <View style={styles.ingredientCircle} />
        )}
        <Text style={styles.ingredientText}>{ingredientName}</Text>
        <View style={styles.checkmark}>
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      </Pressable>
    );
  };

  const ScrollContent = ({ children }: { children: React.ReactNode }) =>
    Platform.OS === "ios" ? (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28, paddingTop: 12 }}
      >
        {children}
      </ScrollView>
    ) : (
      <BottomSheetScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            height: screenHeight,
          }}
        >
          {children}
        </View>
      </BottomSheetScrollView>
    );

  return (
    <BottomSheetModal
      ref={ref}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enableOverDrag={false}
    >
      <BottomSheetView
        style={[styles.contentContainer, { height: screenHeight }]}
      >
        <View>
          <View style={styles.header}>
            <Text style={styles.title}>Search by Ingredients</Text>
            
            <View style={styles.headerRightButtons}>
              {userAllergies.length > 0 && (
                <Pressable
                  hitSlop={24}
                  onPress={() => setShowAllergies(true)}
                  style={({ pressed }) => [
                    styles.allergyBadge,
                    pressed && styles.allergyBadgePressed
                  ]}
                >
                  <View style={styles.allergyIconContainer}>
                    <MaterialCommunityIcons
                      name="alert-circle"
                      size={14}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.allergyCount}>
                    {userAllergies.length}
                  </Text>
                </Pressable>
              )}

              <Pressable
                hitSlop={24}
                onPress={() =>
                  typeof ref !== "function" && ref?.current?.dismiss()
                }
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed
                ]}
              >
                <AntDesign name="close" size={20} color="#6B7280" />
              </Pressable>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={Colors.lilac[500]}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="What's in your pantry"
              placeholderTextColor={Colors.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {isSearching && (
              <ActivityIndicator
                size="small"
                color={Colors.lilac[500]}
                style={styles.searchLoader}
              />
            )}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <ScrollContent>
            {/* Selected Items Section */}
            {selectedItems.length > 0 && (
              <>
                <Text style={styles.subtitle}>Selected</Text>
                <View style={styles.ingredientsContainer}>
                  {selectedItems.map((item) =>
                    renderSelectedIngredientItem(item)
                  )}
                </View>
              </>
            )}

            {/* Main Content Section */}
            <Text style={styles.subtitle}>
              {hasSearched ? "Search Results" : "Popular"}
            </Text>

            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.lilac[500]} />
              </View>
            ) : hasSearched && searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No ingredients found</Text>
              </View>
            ) : (
              <View style={styles.ingredientsContainer}>
                {unselectedItems.map((item) =>
                  renderIngredientItem(item, false)
                )}
              </View>
            )}
          </ScrollContent>
        </View>

        <View style={styles.bottomContainer}>
          <CustomButton
            containerStyle={styles.clearButton}
            onPress={handleClearAll}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </CustomButton>
          <CustomButton
            containerStyle={styles.applyButton}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </CustomButton>
        </View>
      </BottomSheetView>

      {/* Allergies Info Modal */}
      {showAllergies && (
        <Pressable
          style={styles.allergiesOverlay}
          onPress={() => setShowAllergies(false)}
        >
          <Pressable style={styles.allergiesContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.allergiesHeader}>
              <View style={styles.allergiesTitleContainer}>
                <View style={styles.allergiesIconWrapper}>
                  <MaterialCommunityIcons name="shield-alert" size={24} color="#EF4444" />
                </View>
                <Text style={styles.allergiesTitle}>Allergen Alert</Text>
              </View>
              <Pressable
                onPress={() => setShowAllergies(false)}
                style={({ pressed }) => [
                  styles.modalCloseButton,
                  pressed && styles.modalCloseButtonPressed
                ]}
              >
                <AntDesign name="close" size={20} color="#9CA3AF" />
              </Pressable>
            </View>
            
            <Text style={styles.allergiesSubtitle}>
              {userAllergies.length} allergen{userAllergies.length !== 1 ? 's' : ''} filtered from results
            </Text>
            
            <View style={styles.allergiesList}>
              {userAllergies.map((allergy) => (
                <View key={allergy.id} style={styles.allergyItem}>
                  {allergy.imageUrl ? (
                    <Image
                      source={{ uri: allergy.imageUrl }}
                      style={styles.allergyImage}
                    />
                  ) : (
                    <View style={styles.allergyImagePlaceholder}>
                      <MaterialCommunityIcons name="food-off" size={20} color="#EF4444" />
                    </View>
                  )}
                  <View style={styles.allergyInfo}>
                    <Text style={styles.allergyName}>{allergy.name}</Text>
                    <Text style={styles.allergyStatus}>Filtered from search</Text>
                  </View>
                </View>
              ))}
            </View>
            
            <View style={styles.allergiesFooter}>
              <MaterialCommunityIcons name="information-outline" size={16} color="#9CA3AF" />
              <Text style={styles.allergiesNote}>
                Ingredients containing these allergens are automatically hidden from search results to keep you safe.
              </Text>
            </View>
          </Pressable>
        </Pressable>
      )}
    </BottomSheetModal>
  );
});

IngredientModal.displayName = "IngredientModal";

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "semibold",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 4,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    marginVertical: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },
  searchLoader: {
    marginLeft: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  allergyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  allergyBadgePressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  allergyIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  allergyCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  closeButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  ingredientsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 4,
  },
  ingredientItem: {
    justifyContent: "center",
    alignItems: "center",
    width: "22%",
    position: "relative",
  },
  ingredientItemSelected: {
    backgroundColor: Colors.lilac[100],
    borderRadius: 12,
    paddingVertical: 8,
  },
  ingredientItemSelectedPopular: {
    opacity: 0.75,
  },
  ingredientCircle: {
    height: 52,
    width: 52,
    borderRadius: 999,
    resizeMode: "contain",
    padding: 2,
  },
  ingredientText: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: "center",
  },
  checkmark: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: Colors.lilac[500],
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.lilac[100],
  },
  clearButton: {
    backgroundColor: Colors.gray[100],
    flex: 1,
    width: "auto",
    paddingVertical: 16,
  },
  clearButtonText: {
    color: "black",
    fontWeight: "semibold",
  },
  applyButton: {
    backgroundColor: Colors.lilac[900],
    flex: 1,
    width: "auto",
    paddingVertical: 16,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray[400],
  },
  allergiesOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  allergiesContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    maxHeight: "70%",
    width: "90%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  allergiesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  allergiesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allergiesIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  allergiesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  allergiesSubtitle: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginBottom: 20,
    marginLeft: 52,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonPressed: {
    backgroundColor: '#F3F4F6',
  },
  allergiesList: {
    marginBottom: 20,
  },
  allergyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  allergyImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  allergyImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  allergyInfo: {
    flex: 1,
  },
  allergyName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  allergyStatus: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  allergiesFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  allergiesNote: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
