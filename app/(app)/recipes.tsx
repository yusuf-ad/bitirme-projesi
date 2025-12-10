import { getThemeColors } from "@/constants/theme";
import {
  EmptyState,
  EndMessage,
  ErrorState,
  FavoritesEmptyState,
  FavoritesHeroCard,
  FilterChips,
  HomeHeader,
  LoadingState,
  READY_TIME_OPTIONS,
  RecipeGrid,
  SearchBar,
  TimeFilterModal,
  type ReadyTimeOption,
} from "@/features/home";
import { CALORIE_OPTIONS, CalorieFilterModal, type CalorieOption } from "@/features/home/components/calorie-filter-modal";
import { CuisineModal } from "@/features/home/components/cuisine-modal";
import { IngredientModal } from "@/features/home/components/ingredient-modal";
import { useFavoriteRecipes } from "@/features/home/hooks/use-favorite-recipes";
import { useRecipesQuery } from "@/hooks/use-recipes-query";
import { Ingredient, Recipe } from "@/lib/spoonacular";
import { useFilterStore } from "@/lib/stores/filter-store";
import { verifyFavoriteRecipesSetup } from "@/lib/supabase-favorite-recipes-verification";
import { useTheme } from "@/providers/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";

type TabType = "discover" | "favorites";

const FILTER_OPTIONS = ["Healthy", "Easy", "Batch", "Veg"];

export default function HomeTab() {
  const { top, bottom } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark, true); // true = content tab (lighter dark mode)
  const [activeTab, setActiveTab] = useState<TabType>("discover");
  const screenWidth = Dimensions.get("window").width;
  const headerWidth = screenWidth - 32; // 16px padding on each side
  const tabWidth = headerWidth / 2;
  const {
    searchQuery,
    setSearchQuery,
    selectedFilters,
    toggleFilter,
    selectedIngredients,
    setSelectedIngredients,
    selectedCuisines,
    setSelectedCuisines,
    minReadyTime,
    maxReadyTime,
    setReadyTimeRange,
    minCalories,
    maxCalories,
    setCalorieRange,
  } = useFilterStore();
  const horizontalPagerRef = useRef<ScrollView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const ingredientModalRef = useRef<BottomSheetModal>(null);
  const cuisineModalRef = useRef<BottomSheetModal>(null);
  const timeModalRef = useRef<BottomSheetModal>(null);
  const calorieModalRef = useRef<BottomSheetModal>(null);
  const [debouncedSearchQuery] = useDebounce(searchQuery, 400);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    favorites,
    favoritesCount,
    favoriteIds,
    isLoadingFavorites,
    favoritesError,
    refetchFavorites,
    toggleFavorite,
  } = useFavoriteRecipes();
  const hasFavoritesError = Boolean(favoritesError);

  // Animated value for indicator
  const scrollX = useRef(new Animated.Value(0)).current;
  const indicatorTranslateX = scrollX.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [0, tabWidth],
    extrapolate: "clamp",
  });

  // Ingredients ve cuisines'i stabilize et - sonsuz loop'u önlemek için
  const memoizedIngredients = useMemo(
    () => selectedIngredients,
    [selectedIngredients]
  );
  const memoizedCuisines = useMemo(() => selectedCuisines, [selectedCuisines]);

  // Use TanStack Query for caching
  const {
    recipes,
    isLoading: loading,
    hasMore,
    error,
    fetchNextPage,
    refetch,
  } = useRecipesQuery({
    query: debouncedSearchQuery,
    ingredients: memoizedIngredients,
    cuisines: memoizedCuisines,
    pageSize: 10,
    minReadyTime,
    maxReadyTime,
    minCalories,
    maxCalories,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([refetch(), refetchFavorites()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, refetchFavorites]);

  const handleToggleFavorite = useCallback(
    (recipe: Recipe) => {
      toggleFavorite(recipe);
    },
    [toggleFavorite]
  );

  const handleOpenIngredientModal = useCallback(() => {
    ingredientModalRef.current?.present();
  }, []);

  const handleOpenCuisineModal = useCallback(() => {
    cuisineModalRef.current?.present();
  }, []);

  const handleIngredientsSelect = useCallback(
    (ingredients: Ingredient[]) => {
      setSelectedIngredients(ingredients);
    },
    [setSelectedIngredients]
  );

  const handleCuisinesSelect = useCallback(
    (cuisines: string[]) => {
      setSelectedCuisines(cuisines);
    },
    [setSelectedCuisines]
  );

  const handleOpenTimeModal = useCallback(() => {
    timeModalRef.current?.present();
  }, []);

  const selectedTimeOptionId = useMemo(() => {
    const match = READY_TIME_OPTIONS.find(
      (option) =>
        (option.minMinutes ?? null) === (minReadyTime ?? null) &&
        (option.maxMinutes ?? null) === (maxReadyTime ?? null)
    );
    return match?.id ?? null;
  }, [minReadyTime, maxReadyTime]);

  const handleTimeSelect = useCallback(
    (option: ReadyTimeOption | null) => {
      setReadyTimeRange({
        min: option?.minMinutes ?? null,
        max: option?.maxMinutes ?? null,
      });
    },
    [setReadyTimeRange]
  );

  const selectedTimeLabel = useMemo(() => {
    if (!selectedTimeOptionId) {
      return undefined;
    }
    return READY_TIME_OPTIONS.find(
      (option) => option.id === selectedTimeOptionId
    )?.label;
  }, [selectedTimeOptionId]);

  const handleOpenCalorieModal = useCallback(() => {
    calorieModalRef.current?.present();
  }, []);

  const selectedCalorieOptionId = useMemo(() => {
    const match = CALORIE_OPTIONS.find(
      (option) =>
        (option.minCalories ?? null) === (minCalories ?? null) &&
        (option.maxCalories ?? null) === (maxCalories ?? null)
    );
    return match?.id ?? null;
  }, [minCalories, maxCalories]);

  const handleCalorieSelect = useCallback(
    (option: CalorieOption | null) => {
      setCalorieRange({
        min: option?.minCalories ?? null,
        max: option?.maxCalories ?? null,
      });
    },
    [setCalorieRange]
  );

  const selectedCalorieLabel = useMemo(() => {
    if (!selectedCalorieOptionId) {
      return undefined;
    }
    return CALORIE_OPTIONS.find(
      (option) => option.id === selectedCalorieOptionId
    )?.label;
  }, [selectedCalorieOptionId]);

  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 500;

      if (isCloseToBottom && !loading && hasMore) {
        fetchNextPage();
      }
    },
    [loading, hasMore, fetchNextPage]
  );

  const handleTabChange = useCallback(
    async (tab: TabType) => {
      if (tab === activeTab) {
        return;
      }
      const pageIndex = tab === "discover" ? 0 : 1;
      setActiveTab(tab);
      horizontalPagerRef.current?.scrollTo({
        x: pageIndex * screenWidth,
        y: 0,
        animated: true,
      });
      await Haptics.selectionAsync();
    },
    [activeTab, screenWidth]
  );

  const handleHorizontalMomentumEnd = useCallback(
    async (event: any) => {
      const { contentOffset, layoutMeasurement } = event.nativeEvent;
      const pageIndex = Math.round(contentOffset.x / layoutMeasurement.width);
      const newTab: TabType = pageIndex === 0 ? "discover" : "favorites";

      if (newTab !== activeTab) {
        setActiveTab(newTab);
        await Haptics.selectionAsync();
      }
    },
    [activeTab]
  );

  // Supabase setup verification - sadece development'ta
  useEffect(() => {
    if (__DEV__) {
      verifyFavoriteRecipesSetup().then((result) => {
        if (!result.success) {
          console.error("🚨 Favorites setup verification FAILED:");
          console.error("Message:", result.message);
          console.error("Details:", result.details);
        } else {
          console.log(
            "✅ Favorites setup verification PASSED:",
            result.message
          );
        }
      });
    }
  }, []);

  return (
    <View style={[styles.mainContainer, { paddingTop: top, backgroundColor: Colors.background.secondary }]}>
      {/* Header */}
      <HomeHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        favoriteCount={favoritesCount}
        indicatorTranslateX={indicatorTranslateX}
        tabWidth={tabWidth}
      />

      {activeTab === "discover" && (
        <View style={[
          styles.searchContainer,
          {
            backgroundColor: Colors.background.secondary,
            borderBottomColor: Colors.border.light,
          }
        ]}>
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFilterPress={() => { }}
          />

          <FilterChips
            filters={FILTER_OPTIONS}
            selectedFilters={selectedFilters}
            onToggleFilter={toggleFilter}
            onAddIngredients={handleOpenIngredientModal}
            onCuisinePress={handleOpenCuisineModal}
            selectedIngredients={selectedIngredients.map((ing) => ing.name)}
            selectedCuisines={selectedCuisines}
            onTimePress={handleOpenTimeModal}
            selectedTimeLabel={selectedTimeLabel}
            onCaloriePress={handleOpenCalorieModal}
            selectedCalorieLabel={selectedCalorieLabel}
          />
        </View>
      )}

      {/* Swipeable content */}
      <Animated.ScrollView
        ref={horizontalPagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleHorizontalMomentumEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Discover page */}
        <View style={[styles.horizontalPage, { width: screenWidth }]}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.contentScroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: bottom + 52 * (Platform.OS === "ios" ? 1 : 2) },
            ]}
            onScroll={handleScroll}
            scrollEventThrottle={400}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={isDark ? Colors.lilac[400] : Colors.lilac[900]}
              />
            }
          >
            <View style={styles.discoverContainer}>
              {recipes.length === 0 && !loading && <EmptyState />}

              {recipes.length > 0 && (
                <RecipeGrid
                  recipes={recipes}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {loading && <LoadingState />}

              {error && !loading && <ErrorState onRetry={handleRefresh} />}

              {!hasMore && recipes.length > 0 && <EndMessage />}
            </View>
          </ScrollView>
        </View>

        {/* Favorites page */}
        <View style={[styles.horizontalPage, { width: screenWidth }]}>
          <ScrollView
            style={styles.contentScroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: bottom + 52 * (Platform.OS === "ios" ? 1 : 2) },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={isDark ? Colors.lilac[400] : Colors.lilac[900]}
              />
            }
          >
            <View style={styles.favoritesContainer}>
              <FavoritesHeroCard favoriteCount={favoritesCount} />

              {isLoadingFavorites && (
                <LoadingState />
              )}

              {!isLoadingFavorites && hasFavoritesError && (
                <ErrorState
                  onRetry={() => refetchFavorites()}
                />
              )}

              {!isLoadingFavorites &&
                !hasFavoritesError &&
                favorites.length === 0 && (
                  <FavoritesEmptyState
                    onExplore={() => handleTabChange("discover")}
                  />
                )}

              {favorites.length > 0 && (
                <View style={styles.favoritesGridSpacing}>
                  <RecipeGrid
                    recipes={favorites}
                    favoriteIds={favoriteIds}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Animated.ScrollView>

      <IngredientModal
        ref={ingredientModalRef}
        onIngredientsSelect={handleIngredientsSelect}
      />
      <CuisineModal
        ref={cuisineModalRef}
        onCuisinesSelect={handleCuisinesSelect}
      />
      <TimeFilterModal
        ref={timeModalRef}
        selectedOptionId={selectedTimeOptionId}
        onSelect={handleTimeSelect}
      />
      <CalorieFilterModal
        ref={calorieModalRef}
        selectedOptionId={selectedCalorieOptionId}
        onSelect={handleCalorieSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  horizontalPage: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,

    borderBottomWidth: 1,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,

    elevation: 3,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  discoverContainer: {
    marginTop: 16,
  },
  favoritesContainer: {
    marginTop: 16,
    gap: 16,
  },
  favoritesGridSpacing: {
    marginTop: 8,
  },
});
