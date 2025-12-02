import { Colors } from "@/constants/theme";
import { LoadingState } from "@/features/home";
import { RecipeCard } from "@/features/home/components/recipe-card";
import { useAuthContext } from "@/hooks/use-auth-context";
import { MEAL_TYPES } from "@/lib/constants";
import { getIngredientInformation, Recipe } from "@/lib/spoonacular";
import {
  ComplexSearchOptions,
  searchRecipesComplex,
} from "@/lib/spoonacular-complex-search";
import { getUserOnboardingProfile } from "@/lib/supabase-onboarding";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PantryItem } from "../types";

interface RecipeIdeasViewProps {
  pantryItems: PantryItem[];
  searchQuery: string;
  onTotalResultsChange?: (total: number) => void;
}

type MealTypeFilter = "all" | string;

const SPOONACULAR_TYPE_MAPPING: Record<string, string> = {
  breakfast: MEAL_TYPES.BREAKFAST,
  lunch: `${MEAL_TYPES.MAIN_COURSE},${MEAL_TYPES.SALAD},${MEAL_TYPES.SOUP}`,
  dinner: MEAL_TYPES.MAIN_COURSE,
};

const FILTER_OPTIONS: { label: string; value: MealTypeFilter }[] = [
  { label: "All", value: "all" },
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
];

export function RecipeIdeasView({
  pantryItems,
  searchQuery,
  onTotalResultsChange,
}: RecipeIdeasViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuthContext();
  const userId = session?.user?.id;

  const [selectedFilter, setSelectedFilter] = useState<MealTypeFilter>("all");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const PAGE_SIZE = 20;

  // Cache allergy names to avoid refetching
  const allergyNamesCache = useRef<string[]>([]);
  const lastAllergyIds = useRef<string[]>([]);

  // Fetch onboarding data for user preferences
  const { data: onboardingData } = useQuery({
    queryKey: ["onboardingProfile", userId],
    queryFn: () => getUserOnboardingProfile(userId!),
    enabled: !!userId,
  });

  // Convert pantry items to ingredient string for API
  const ingredientsString = useMemo(() => {
    return pantryItems
      .map((item) => item.spoonacular_name || item.name)
      .filter((name) => name)
      .join(",");
  }, [pantryItems]);

  // Create stable query key
  const queryKey = useMemo(
    () => [
      "recipeIdeas",
      ingredientsString,
      selectedFilter,
      debouncedSearchQuery,
      onboardingData?.tastePreferences?.cuisines?.join(",") ?? "",
      onboardingData?.tastePreferences?.diet_preferences?.join(",") ?? "",
      onboardingData?.tastePreferences?.allergies_dislikes?.join(",") ?? "",
      onboardingData?.tastePreferences?.cuisine_dislikes?.join(",") ?? "",
    ],
    [
      ingredientsString,
      selectedFilter,
      debouncedSearchQuery,
      onboardingData?.tastePreferences,
    ]
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      // Prepare user preferences from onboarding data
      const preferences = onboardingData?.tastePreferences;

      // Cuisines
      const cuisineParam = preferences?.cuisines?.join(",");

      // Diets
      const dietParam = preferences?.diet_preferences?.join(",");

      // Allergies / Dislikes (Fetch names from IDs)
      const allergyIds = preferences?.allergies_dislikes || [];
      let allergyNames: string[] = [];

      // Check if allergy IDs changed, if not use cached names
      const allergyIdsChanged =
        JSON.stringify(allergyIds) !== JSON.stringify(lastAllergyIds.current);

      if (allergyIds.length > 0 && allergyIdsChanged) {
        console.log("Fetching allergy ingredient names...");
        for (let i = 0; i < allergyIds.length; i++) {
          try {
            const id = parseInt(allergyIds[i]);
            if (!isNaN(id)) {
              const info = await getIngredientInformation(id);
              if (info.name) {
                allergyNames.push(info.name);
              }
            }
          } catch (e) {
            console.error(
              `Failed to fetch info for allergy ID ${allergyIds[i]}`,
              e
            );
          }
        }
        // Cache the results
        allergyNamesCache.current = allergyNames;
        lastAllergyIds.current = allergyIds;
      } else if (allergyIds.length > 0) {
        // Use cached names
        allergyNames = allergyNamesCache.current;
      }

      const excludeIngredientsParam = allergyNames.join(",");

      // Cuisine dislikes
      const excludeCuisineParam = preferences?.cuisine_dislikes
        ?.map((c: string) => c.toLowerCase())
        .join(",");

      console.log("User preferences:", {
        cuisines: cuisineParam,
        diets: dietParam,
        excludeIngredients: excludeIngredientsParam,
        excludeCuisine: excludeCuisineParam,
      });

      const options: ComplexSearchOptions = {
        // Dynamic Parameters from Onboarding
        cuisine: cuisineParam,
        excludeCuisine: excludeCuisineParam,
        diet: dietParam,
        excludeIngredients: excludeIngredientsParam,

        // Pantry ingredients
        includeIngredients: ingredientsString,
        addRecipeNutrition: true,
        number: PAGE_SIZE,
        offset: pageParam,
        sort: "max-used-ingredients",
        fillIngredients: false,
        ignorePantry: false,
      };

      if (selectedFilter === "all") {
        // For "all", combine all meal types
        const allTypes = Object.values(SPOONACULAR_TYPE_MAPPING).join(",");
        options.type = allTypes;
      } else {
        const apiType =
          SPOONACULAR_TYPE_MAPPING[selectedFilter] || selectedFilter;
        options.type = apiType;
      }

      if (debouncedSearchQuery.trim()) {
        options.query = debouncedSearchQuery.trim();
      }

      const response = await searchRecipesComplex(options);
      return {
        recipes: response.results,
        totalResults: response.totalResults,
        offset: pageParam,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, page) => sum + page.recipes.length,
        0
      );
      return totalFetched < lastPage.totalResults ? totalFetched : undefined;
    },
    initialPageParam: 0,
    enabled: pantryItems.length > 0,
    gcTime: 1000 * 60 * 30, // Keep cache for 30 minutes
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Flatten and deduplicate all pages
  const recipes = useMemo(() => {
    if (!data?.pages) return [];
    const allRecipes = data.pages.flatMap((page) => page.recipes);
    // Deduplicate by id
    const seenIds = new Set<number>();
    return allRecipes.filter((recipe) => {
      if (seenIds.has(recipe.id)) return false;
      seenIds.add(recipe.id);
      return true;
    });
  }, [data?.pages]);

  const isLoading = status === "pending";
  const hasMore = hasNextPage ?? false;

  // Update total results when data changes
  useEffect(() => {
    if (data?.pages?.[0]?.totalResults !== undefined) {
      onTotalResultsChange?.(data.pages[0].totalResults);
    }
  }, [data?.pages, onTotalResultsChange]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRecipePress = (recipe: Recipe) => {
    router.push(`/(meal)/${recipe.id}`);
  };

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasMore) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasMore, fetchNextPage]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <View style={styles.cardContainer}>
      <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} />
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.lilac[900]} />
        <Text style={styles.loadingMoreText}>Loading more recipes...</Text>
      </View>
    );
  };

  if (pantryItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Add ingredients to your pantry to get recipe ideas!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContainer}
        bounces={false}
      >
        {FILTER_OPTIONS.map((filter) => (
          <Pressable
            key={filter.value}
            style={[
              styles.filterButton,
              selectedFilter === filter.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.value && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Recipe Grid */}
      {isLoading ? (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <LoadingState count={8} />
        </ScrollView>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom * 2 + 52 },
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.lilac[900]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  banner: {
    backgroundColor: Colors.lilac[900],
    borderRadius: 12,
    padding: 16,
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    width: "100%",
    borderBottomColor: Colors.lilac[400],
    borderBottomWidth: 1,
    gap: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    height: 36,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  filterButtonActive: {
    backgroundColor: Colors.lilac[900],
    borderColor: Colors.lilac[900],
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardContainer: {
    width: "48%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
