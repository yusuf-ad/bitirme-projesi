import { POPULAR_INGREDIENTS } from "@/lib/constants";
import {
  getIngredientInformation,
  searchIngredients,
  type Ingredient,
} from "@/lib/spoonacular";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AllergyItem } from "../types";
import {
  createFallbackAllergyItem,
  getIngredientKey,
  SEARCH_DEBOUNCE_MS,
} from "../utils/allergy-helpers";

interface UseAllergySearchOptions {
  initialSelection?: string[];
  onSelectionChange?: (selectedAllergies: string[]) => void;
}

export function useAllergySearch({
  initialSelection = [],
  onSelectionChange,
}: UseAllergySearchOptions) {
  const [selectedAllergiesMap, setSelectedAllergiesMap] = useState<
    Map<string, AllergyItem>
  >(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce timer ref
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Load initial selection from saved IDs
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
  }, [initialSelection]);

  // Toggle allergy selection
  const toggleAllergy = useCallback(
    (item: AllergyItem) => {
      const key = getIngredientKey(item);
      setSelectedAllergiesMap((prev) => {
        const isCurrentlySelected = prev.has(key);
        const newMap = new Map(prev);

        if (isCurrentlySelected) {
          newMap.delete(key);
        } else {
          newMap.set(key, item);
        }

        // Notify parent of selection change
        onSelectionChange?.(Array.from(newMap.keys()));
        return newMap;
      });
    },
    [onSelectionChange]
  );

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedAllergiesMap(new Map());
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  // Computed values
  const displayItems = hasSearched ? searchResults : POPULAR_INGREDIENTS;
  const selectedItems = Array.from(selectedAllergiesMap.values());
  const unselectedItems = displayItems.filter(
    (item) => !selectedAllergiesMap.has(getIngredientKey(item))
  );

  return {
    // Search state
    searchQuery,
    isSearching,
    hasSearched,
    searchResults,

    // Selection state
    selectedItems,
    unselectedItems,
    displayItems,

    // Actions
    handleSearchTextChange,
    clearSearch,
    toggleAllergy,
    clearAllSelections,

    // Helpers
    getIngredientKey,
  };
}

