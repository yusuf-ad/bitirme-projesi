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
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
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
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  Layout,
  SlideInRight,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  ZoomIn,
  ZoomOut,
  interpolateColor,
  withSequence,
  runOnJS,
} from "react-native-reanimated";

interface IngredientModalProps {
  onIngredientsSelect?: (ingredients: Ingredient[]) => void;
}

interface DisplayAllergy {
  id: string;
  name: string;
  image?: string;
  imageUrl?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const searchFocused = useSharedValue(0);
  const allergyPulse = useSharedValue(1);

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  // Animated search bar style
  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        searchFocused.value,
        [0, 1],
        [Colors.lilac[200], Colors.lilac[500]]
      ),
      shadowOpacity: withTiming(searchFocused.value * 0.15),
      transform: [{ scale: withSpring(1 + searchFocused.value * 0.01) }],
    };
  });

  // Allergy badge pulse animation
  const allergyBadgeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: allergyPulse.value }],
    };
  });

  // Start pulse animation for allergy badge
  useEffect(() => {
    if (userAllergies.length > 0) {
      allergyPulse.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
    }
  }, [userAllergies.length]);

  const renderIngredientItem = (
    item: Ingredient | (typeof POPULAR_INGREDIENTS)[0],
    isSelected: boolean,
    index: number
  ) => {
    const ingredientName = getItemName(item);
    const ingredientImage = getItemImage(item);
    const key = getIngredientKey(item);

    return (
      <Animated.View
        key={`ingredient-${key}`}
        entering={FadeInUp.delay(index * 30).springify()}
        exiting={FadeOutDown.duration(200)}
        layout={Layout.springify()}
      >
        <Pressable
          style={({ pressed }) => [
            styles.ingredientItem,
            isSelected && styles.ingredientItemSelectedPopular,
            pressed && styles.ingredientItemPressed,
          ]}
          onPress={() => toggleIngredient(item)}
        >
          <View style={styles.ingredientImageWrapper}>
            {ingredientImage ? (
              <Image
                source={{
                  uri: `${INGREDIENT_IMAGE_BASE_URL}/${ingredientImage}`,
                }}
                style={[styles.ingredientCircle, isSelected && styles.ingredientCircleSelected]}
              />
            ) : (
              <View style={[styles.ingredientCircle, styles.ingredientCirclePlaceholder]} />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.08)']}
              style={styles.ingredientImageOverlay}
            />
          </View>
          <Text
            style={[styles.ingredientText, isSelected && styles.ingredientTextSelected]}
            numberOfLines={2}
          >
            {ingredientName}
          </Text>
          {isSelected && (
            <Animated.View
              entering={ZoomIn.springify()}
              exiting={ZoomOut.duration(150)}
              style={styles.checkmark}
            >
              <LinearGradient
                colors={[Colors.lilac[600], Colors.lilac[800]]}
                style={styles.checkmarkGradient}
              >
                <Ionicons name="checkmark" size={14} color="white" />
              </LinearGradient>
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  const renderSelectedIngredientItem = (
    item: Ingredient | (typeof POPULAR_INGREDIENTS)[0],
    index: number
  ) => {
    const ingredientName = getItemName(item);
    const ingredientImage = getItemImage(item);
    const key = getIngredientKey(item);

    return (
      <Animated.View
        key={`selected-${key}`}
        entering={SlideInRight.delay(index * 50).springify()}
        exiting={SlideOutRight.duration(200)}
        layout={Layout.springify()}
      >
        <Pressable
          style={({ pressed }) => [
            styles.ingredientItem,
            styles.ingredientItemSelected,
            pressed && styles.ingredientItemPressed,
          ]}
          onPress={() => toggleIngredient(item)}
        >
          <View style={styles.ingredientImageWrapper}>
            {ingredientImage ? (
              <Image
                source={{
                  uri: `${INGREDIENT_IMAGE_BASE_URL}/${ingredientImage}`,
                }}
                style={styles.ingredientCircle}
              />
            ) : (
              <View style={[styles.ingredientCircle, styles.ingredientCirclePlaceholder]} />
            )}
            <View style={styles.selectedRing} />
          </View>
          <Text style={styles.ingredientText} numberOfLines={2}>
            {ingredientName}
          </Text>
          <Animated.View
            entering={ZoomIn.springify()}
            style={styles.checkmark}
          >
            <LinearGradient
              colors={[Colors.lilac[600], Colors.lilac[800]]}
              style={styles.checkmarkGradient}
            >
              <Ionicons name="checkmark" size={14} color="white" />
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </Animated.View>
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
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.modalBackground}
    >
      <BottomSheetView
        style={[styles.contentContainer, { height: screenHeight }]}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Animated.View 
            entering={FadeInDown.delay(100).springify()}
            style={styles.header}
          >
            <View style={styles.titleContainer}>
              <View style={styles.titleIconWrapper}>
                <Ionicons name="restaurant" size={20} color={Colors.lilac[600]} />
              </View>
              <View>
                <Text style={styles.title}>Ingredient Search</Text>
                <Text style={styles.titleSubtext}>Find recipes with what you have</Text>
              </View>
            </View>
            
            <View style={styles.headerRightButtons}>
              {userAllergies.length > 0 && (
                <AnimatedPressable
                  hitSlop={24}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowAllergies(true);
                  }}
                  style={[styles.allergyBadge, allergyBadgeAnimatedStyle]}
                >
                  <LinearGradient
                    colors={['#FEF2F2', '#FEE2E2']}
                    style={styles.allergyBadgeGradient}
                  >
                    <View style={styles.allergyIconContainer}>
                      <MaterialCommunityIcons
                        name="shield-alert-outline"
                        size={14}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={styles.allergyCount}>
                      {userAllergies.length}
                    </Text>
                    <Ionicons name="chevron-forward" size={12} color="#DC2626" />
                  </LinearGradient>
                </AnimatedPressable>
              )}

              <Pressable
                hitSlop={24}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  typeof ref !== "function" && ref?.current?.dismiss();
                }}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed
                ]}
              >
                <AntDesign name="close" size={18} color="#9CA3AF" />
              </Pressable>
            </View>
          </Animated.View>

          {/* Search Bar */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={[styles.searchBar, searchBarAnimatedStyle]}
          >
            <View style={styles.searchIconWrapper}>
              <Ionicons
                name="search"
                size={18}
                color={Colors.lilac[500]}
              />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="What's in your pantry?"
              placeholderTextColor={Colors.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => {
                searchFocused.value = withTiming(1, { duration: 200 });
              }}
              onBlur={() => {
                searchFocused.value = withTiming(0, { duration: 200 });
              }}
            />
            {searchQuery.length > 0 && !isSearching && (
              <Animated.View entering={FadeIn} exiting={FadeOut}>
                <Pressable
                  onPress={() => setSearchQuery("")}
                  style={styles.clearSearchButton}
                >
                  <AntDesign name="closecircle" size={16} color={Colors.gray[400]} />
                </Pressable>
              </Animated.View>
            )}
            {isSearching && (
              <Animated.View entering={FadeIn} exiting={FadeOut}>
                <ActivityIndicator
                  size="small"
                  color={Colors.lilac[500]}
                />
              </Animated.View>
            )}
          </Animated.View>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1 }}>
          <ScrollContent>
            {/* Selected Items Section */}
            {selectedItems.length > 0 && (
              <Animated.View
                entering={FadeInDown.springify()}
                layout={Layout.springify()}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.sectionIconWrapper}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.lilac[600]} />
                    </View>
                    <Text style={styles.subtitle}>Selected</Text>
                  </View>
                  <View style={styles.selectedCountBadge}>
                    <Text style={styles.selectedCountText}>{selectedItems.length}</Text>
                  </View>
                </View>
                <View style={styles.ingredientsContainer}>
                  {selectedItems.map((item, index) =>
                    renderSelectedIngredientItem(item, index)
                  )}
                </View>
              </Animated.View>
            )}

            {/* Main Content Section */}
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.sectionHeader}
            >
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionIconWrapper}>
                  <Ionicons 
                    name={hasSearched ? "search" : "flame"} 
                    size={16} 
                    color={hasSearched ? Colors.lilac[600] : "#F59E0B"} 
                  />
                </View>
                <Text style={styles.subtitle}>
                  {hasSearched ? "Search Results" : "Popular Ingredients"}
                </Text>
              </View>
            </Animated.View>

            {isSearching ? (
              <Animated.View 
                entering={FadeIn}
                style={styles.loadingContainer}
              >
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="large" color={Colors.lilac[500]} />
                  <Text style={styles.loadingText}>Searching ingredients...</Text>
                </View>
              </Animated.View>
            ) : hasSearched && searchResults.length === 0 ? (
              <Animated.View 
                entering={FadeIn.springify()}
                style={styles.emptyContainer}
              >
                <View style={styles.emptyIconWrapper}>
                  <Ionicons name="search-outline" size={48} color={Colors.gray[300]} />
                </View>
                <Text style={styles.emptyTitle}>No ingredients found</Text>
                <Text style={styles.emptyText}>Try a different search term</Text>
              </Animated.View>
            ) : (
              <View style={styles.ingredientsContainer}>
                {unselectedItems.map((item, index) =>
                  renderIngredientItem(item, false, index)
                )}
              </View>
            )}
          </ScrollContent>
        </View>

        {/* Bottom Action Buttons */}
        <Animated.View 
          entering={FadeInUp.delay(400).springify()}
          style={styles.bottomContainer}
        >
          <Pressable
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.buttonPressed
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleClearAll();
            }}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.gray[600]} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </Pressable>
          
          <Pressable
            style={({ pressed }) => [
              styles.applyButton,
              pressed && styles.buttonPressed,
              selectedItems.length === 0 && styles.applyButtonDisabled
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleApply();
            }}
          >
            <LinearGradient
              colors={selectedItems.length > 0 
                ? [Colors.lilac[700], Colors.lilac[900]] 
                : [Colors.gray[300], Colors.gray[400]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.applyButtonGradient}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={18} 
                color="white" 
              />
              <Text style={styles.applyButtonText}>
                {selectedItems.length > 0 
                  ? `Apply (${selectedItems.length})` 
                  : 'Select Ingredients'}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </BottomSheetView>

      {/* Allergies Info Modal */}
      {showAllergies && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.allergiesOverlay}
        >
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => setShowAllergies(false)} 
          />
          <Animated.View
            entering={FadeInUp.springify()}
            exiting={FadeOutDown.duration(200)}
            style={styles.allergiesContainer}
          >
            {/* Allergy Modal Header */}
            <LinearGradient
              colors={['#FEF2F2', '#FFFFFF']}
              style={styles.allergiesHeaderGradient}
            >
              <View style={styles.allergiesHeader}>
                <View style={styles.allergiesTitleContainer}>
                  <View style={styles.allergiesIconWrapper}>
                    <LinearGradient
                      colors={['#FCA5A5', '#EF4444']}
                      style={styles.allergiesIconGradient}
                    >
                      <MaterialCommunityIcons name="shield-alert" size={24} color="white" />
                    </LinearGradient>
                  </View>
                  <View>
                    <Text style={styles.allergiesTitle}>Allergen Protection</Text>
                    <Text style={styles.allergiesSubtitleSmall}>Active filters</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => setShowAllergies(false)}
                  style={({ pressed }) => [
                    styles.modalCloseButton,
                    pressed && styles.modalCloseButtonPressed
                  ]}
                >
                  <AntDesign name="close" size={18} color="#9CA3AF" />
                </Pressable>
              </View>
            </LinearGradient>
            
            {/* Allergy Count Badge */}
            <View style={styles.allergyCountContainer}>
              <View style={styles.allergyCountBadge}>
                <Text style={styles.allergyCountBadgeText}>
                  {userAllergies.length} allergen{userAllergies.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={styles.allergiesSubtitle}>
                automatically filtered from search results
              </Text>
            </View>
            
            {/* Allergy List */}
            <ScrollView 
              style={styles.allergiesList}
              showsVerticalScrollIndicator={false}
            >
              {userAllergies.map((allergy, index) => (
                <Animated.View
                  key={allergy.id}
                  entering={FadeInUp.delay(index * 80).springify()}
                  style={styles.allergyItem}
                >
                  <LinearGradient
                    colors={['#FFF5F5', '#FEFEFE']}
                    style={styles.allergyItemGradient}
                  >
                    {allergy.imageUrl ? (
                      <Image
                        source={{ uri: allergy.imageUrl }}
                        style={styles.allergyImage}
                      />
                    ) : (
                      <View style={styles.allergyImagePlaceholder}>
                        <MaterialCommunityIcons name="food-off" size={22} color="#EF4444" />
                      </View>
                    )}
                    <View style={styles.allergyInfo}>
                      <Text style={styles.allergyName}>{allergy.name}</Text>
                      <View style={styles.allergyStatusRow}>
                        <View style={styles.allergyStatusDot} />
                        <Text style={styles.allergyStatus}>Actively filtered</Text>
                      </View>
                    </View>
                    <View style={styles.allergyCheckIcon}>
                      <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                    </View>
                  </LinearGradient>
                </Animated.View>
              ))}
            </ScrollView>
            
            {/* Footer Info */}
            <View style={styles.allergiesFooter}>
              <LinearGradient
                colors={['#F9FAFB', '#F3F4F6']}
                style={styles.allergiesFooterGradient}
              >
                <View style={styles.allergiesFooterIcon}>
                  <Ionicons name="information-circle" size={20} color={Colors.lilac[500]} />
                </View>
                <Text style={styles.allergiesNote}>
                  Ingredients containing these allergens are automatically hidden to keep you safe.
                </Text>
              </LinearGradient>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </BottomSheetModal>
  );
});

IngredientModal.displayName = "IngredientModal";

const styles = StyleSheet.create({
  // Modal Base Styles
  handleIndicator: {
    backgroundColor: Colors.gray[300],
    width: 40,
    height: 4,
  },
  modalBackground: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },

  // Header Section
  headerContainer: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lilac[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  titleSubtext: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // Allergy Badge
  allergyBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  allergyBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  allergyIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allergyCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
    marginHorizontal: 2,
  },

  // Close Button
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  closeButtonPressed: {
    backgroundColor: '#E5E7EB',
    transform: [{ scale: 0.95 }],
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 8,
    borderWidth: 1.5,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: Colors.lilac[500],
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  searchIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.lilac[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  clearSearchButton: {
    padding: 4,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.lilac[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    letterSpacing: -0.2,
  },
  selectedCountBadge: {
    backgroundColor: Colors.lilac[600],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },

  // Ingredients Grid
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 24,
  },
  ingredientItem: {
    width: 78,
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  ingredientItemPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  ingredientItemSelected: {
    backgroundColor: Colors.lilac[100],
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  ingredientItemSelectedPopular: {
    opacity: 0.6,
  },
  ingredientImageWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  ingredientCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  ingredientCircleSelected: {
    borderColor: Colors.lilac[400],
    borderWidth: 2,
  },
  ingredientCirclePlaceholder: {
    backgroundColor: Colors.gray[100],
  },
  ingredientImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  selectedRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.lilac[500],
    borderStyle: 'dashed',
  },
  ingredientText: {
    fontSize: 11,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
    maxWidth: 70,
  },
  ingredientTextSelected: {
    color: Colors.lilac[800],
    fontWeight: '600',
  },

  // Checkmark
  checkmark: {
    position: 'absolute',
    top: 0,
    right: 2,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.lilac[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmarkGradient: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingContent: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[400],
  },

  // Bottom Buttons
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    backgroundColor: '#FAFAFA',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  applyButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.lilac[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.2,
  },

  // Allergies Modal
  allergiesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  allergiesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    marginHorizontal: 16,
    maxHeight: '75%',
    width: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  allergiesHeaderGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  allergiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  allergiesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  allergiesIconWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  allergiesIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allergiesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  allergiesSubtitleSmall: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
    marginTop: 2,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonPressed: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  // Allergy Count Section
  allergyCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  allergyCountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  allergyCountBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  allergiesSubtitle: {
    fontSize: 13,
    color: Colors.text.tertiary,
    flex: 1,
  },

  // Allergy List
  allergiesList: {
    maxHeight: 280,
    paddingHorizontal: 16,
  },
  allergyItem: {
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  allergyItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  allergyImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  allergyImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  allergyInfo: {
    flex: 1,
  },
  allergyName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  allergyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  allergyStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  allergyStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  allergyCheckIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Allergy Footer
  allergiesFooter: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  allergiesFooterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  allergiesFooterIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.lilac[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  allergiesNote: {
    fontSize: 12,
    color: Colors.text.tertiary,
    flex: 1,
    lineHeight: 18,
  },
});
