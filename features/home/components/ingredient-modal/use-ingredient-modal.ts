import { resolveAllergiesFast } from "@/lib/allergies-diet-helpers";
import { POPULAR_INGREDIENTS } from "@/lib/constants";
import { searchIngredients, type Ingredient } from "@/lib/spoonacular";
import { useOnboarding } from "@/providers/onboarding-provider";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { DisplayAllergy, IngredientItem, PopularIngredient } from "./types";

export interface UseIngredientModalOptions {
  initialSelectedIngredients?: Ingredient[];
}

export const useIngredientModal = (options: UseIngredientModalOptions = {}) => {
  const { initialSelectedIngredients = [] } = options;
  const onboarding = useOnboarding();

  // Convert initial ingredients to Map
  const buildInitialMap = useCallback(
    (ingredients: Ingredient[]): Map<string, IngredientItem> => {
      const map = new Map<string, IngredientItem>();
      ingredients.forEach((ing) => {
        const key = `${ing.id}`;
        map.set(key, ing);
      });
      return map;
    },
    []
  );

  const [selectedIngredients, setSelectedIngredients] = useState<
    Map<string, IngredientItem>
  >(() => buildInitialMap(initialSelectedIngredients));
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [showAllergies, setShowAllergies] = useState<boolean>(false);
  const [userAllergies, setUserAllergies] = useState<DisplayAllergy[]>([]);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchFocused = useSharedValue(0);
  const isCollapsed = useSharedValue(0);

  // Load onboarding data when modal mounts
  useEffect(() => {
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Note: We don't sync from initialSelectedIngredients after mount
  // because changes flow one-way: modal -> filter-store via onIngredientsSelect

  // Load user allergies when modal opens
  useEffect(() => {
    if (
      onboarding.selectedAllergies &&
      onboarding.selectedAllergies.length > 0
    ) {
      const allergies = resolveAllergiesFast(onboarding.selectedAllergies);
      setUserAllergies(allergies);
    } else {
      setUserAllergies([]);
    }
  }, [onboarding.selectedAllergies]);

  const getIngredientKey = useCallback((item: IngredientItem): string => {
    if ("id" in item && typeof item.id === "number") {
      return `${item.id}`;
    }
    const spoonacularId = (item as PopularIngredient).spoonacularId;
    if (typeof spoonacularId === "number") {
      return `${spoonacularId}`;
    }
    return `name-${(item as any).name?.toLowerCase?.() ?? "unknown"}`;
  }, []);

  const toggleIngredient = useCallback(
    (item: IngredientItem) => {
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
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
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
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 600);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Selected items
  const selectedItems = useMemo(
    () => Array.from(selectedIngredients.values()),
    [selectedIngredients]
  );

  // Selected keys set for O(1) lookup
  const selectedKeysSet = useMemo(
    () => new Set(selectedIngredients.keys()),
    [selectedIngredients]
  );

  // Check if ingredient contains allergens
  const containsAllergens = useCallback(
    (ingredientName: string): boolean => {
      if (!userAllergies.length) return false;
      const lowerIngredientName = ingredientName.toLowerCase();
      return userAllergies.some((allergy) =>
        lowerIngredientName.includes(allergy.name.toLowerCase())
      );
    },
    [userAllergies]
  );

  // Display items - filtered for allergens
  const displayItems = useMemo(() => {
    // Log parameters for debugging as requested
    console.log("--- Ingredient Filter Debug ---");
    console.log("Search Query:", searchQuery);
    console.log("Has Searched:", hasSearched);
    console.log("User Allergies:", userAllergies);
    console.log(
      "Selected Ingredients:",
      Array.from(selectedIngredients.keys())
    );

    if (!hasSearched) {
      const filteredPopular = POPULAR_INGREDIENTS.filter(
        (item) => !containsAllergens(item.name)
      );
      console.log(
        "Displaying Popular Ingredients (Count):",
        filteredPopular.length
      );
      return filteredPopular;
    }

    console.log("Raw Search Results (Count):", searchResults.length);
    const filteredSearch = searchResults.filter((item) => {
      const isSelected = selectedIngredients.has(getIngredientKey(item));
      const hasAllergen = containsAllergens(item.name);

      if (item.name.toLowerCase().includes("chicken")) {
        console.log(
          `Checking item: ${item.name}, isSelected: ${isSelected}, hasAllergen: ${hasAllergen}`
        );
      }

      return !isSelected && !hasAllergen;
    });
    console.log("Filtered Search Results (Count):", filteredSearch.length);
    return filteredSearch;
  }, [
    hasSearched,
    searchResults,
    selectedIngredients,
    getIngredientKey,
    containsAllergens,
    searchQuery, // Added searchQuery to dependency for logging updates
    userAllergies, // Added userAllergies to dependency for logging updates
  ]);

  // Scroll handler for collapsing selected section
  const handleScroll = useCallback(
    (offsetY: number) => {
      const shouldCollapse = offsetY > 80;
      if (shouldCollapse !== isScrolledDown) {
        setIsScrolledDown(shouldCollapse);
        isCollapsed.value = withTiming(shouldCollapse ? 1 : 0, {
          duration: 200,
        });
      }
    },
    [isScrolledDown, isCollapsed]
  );

  const getIngredientsToSend = useCallback((): Ingredient[] => {
    return selectedItems.map((item) => {
      if ("id" in item && typeof item.id === "number") {
        return item as Ingredient;
      }
      const popularItem = item as PopularIngredient;
      return {
        id: popularItem.spoonacularId ?? 0,
        name: popularItem.name,
        image: popularItem.image,
      };
    });
  }, [selectedItems]);

  return {
    // State
    selectedIngredients,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasSearched,
    showAllergies,
    setShowAllergies,
    userAllergies,
    isScrolledDown,
    searchFocused,
    isCollapsed,

    // Derived state
    selectedItems,
    selectedKeysSet,
    displayItems,

    // Actions
    getIngredientKey,
    toggleIngredient,
    handleClearAll,
    handleScroll,
    getIngredientsToSend,
  };
};
