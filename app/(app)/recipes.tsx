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
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const { recipes, loading, hasMore, error, onEndReached, refresh } =
    useInfiniteScroll({
      initialPageSize: 10,
      pageSize: 10,
    });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

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

      {/* Search Bar and Filters */}
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
          onAddIngredients={() => {}}
        />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
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
