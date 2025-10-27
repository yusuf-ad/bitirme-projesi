import { Colors } from "@/constants/theme";
import {
  EmptyState,
  EndMessage,
  ErrorState,
  FilterChips,
  HomeHeader,
  LoadingState,
  RecipeGrid,
  SearchBar,
} from "@/features/home";
import { CuisineModal } from "@/features/home/components/cuisine-modal";
import { IngredientModal } from "@/features/home/components/ingredient-modal";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Ingredient } from "@/lib/spoonacular";
import { useFilterStore } from "@/lib/stores/filter-store";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useRef, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabType = "discover" | "favorites";

const FILTER_OPTIONS = ["Healthy", "Easy", "Batch", "Veg"];

export default function HomeTab() {
  const { top, bottom } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("discover");
  const {
    searchQuery,
    setSearchQuery,
    selectedFilters,
    toggleFilter,
    selectedIngredients,
    setSelectedIngredients,
    selectedCuisines,
    setSelectedCuisines,
  } = useFilterStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const ingredientModalRef = useRef<BottomSheetModal>(null);
  const cuisineModalRef = useRef<BottomSheetModal>(null);
  const { recipes, loading, hasMore, error, onEndReached, refresh } =
    useInfiniteScroll({
      initialPageSize: 1,
      pageSize: 10,
      ingredients: selectedIngredients,
      cuisines: selectedCuisines,
    });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

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

  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 500;

      if (isCloseToBottom && !loading && hasMore) {
        onEndReached();
      }
    },
    [loading, hasMore, onEndReached]
  );

  return (
    <View style={[styles.mainContainer, { paddingTop: top }]}>
      {/* Header */}
      <HomeHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "discover" && (
        <View style={styles.searchContainer}>
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFilterPress={() => {}}
          />

          <FilterChips
            filters={FILTER_OPTIONS}
            selectedFilters={selectedFilters}
            onToggleFilter={toggleFilter}
            onAddIngredients={handleOpenIngredientModal}
            onCuisinePress={handleOpenCuisineModal}
            selectedIngredients={selectedIngredients.map((ing) => ing.name)}
            selectedCuisines={selectedCuisines}
          />
        </View>
      )}

      {/* Content - Scrollable */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.contentScroll}
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
            tintColor={Colors.lilac[900]}
          />
        }
      >
        {/* Content */}
        {activeTab === "discover" && (
          <View style={styles.discoverContainer}>
            {recipes.length === 0 && !loading && <EmptyState />}

            {recipes.length > 0 && <RecipeGrid recipes={recipes} />}

            {loading && <LoadingState />}

            {error && !loading && <ErrorState onRetry={handleRefresh} />}

            {!hasMore && recipes.length > 0 && <EndMessage />}
          </View>
        )}

        {activeTab === "favorites" && (
          <View>{/* Favorites content buraya gelecek */}</View>
        )}
      </ScrollView>

      <IngredientModal
        ref={ingredientModalRef}
        onIngredientsSelect={handleIngredientsSelect}
      />
      <CuisineModal
        ref={cuisineModalRef}
        onCuisinesSelect={handleCuisinesSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
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
});
