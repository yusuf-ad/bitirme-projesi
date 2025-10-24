import { Colors } from "@/constants/theme";
import { RecipeCard } from "@/features/home/components/recipe-card";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
      <View style={styles.headerContainer}>
        <Pressable
          onPress={() => setActiveTab("discover")}
          style={[
            styles.tabButton,
            activeTab === "discover"
              ? styles.tabButtonActive
              : styles.tabButtonInactive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "discover"
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}
          >
            Discover
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("favorites")}
          style={[
            styles.tabButton,
            activeTab === "favorites"
              ? styles.tabButtonActive
              : styles.tabButtonInactive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "favorites"
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}
          >
            Favorites
          </Text>
        </Pressable>
      </View>

      {/* Search Bar and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBarRow}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={Colors.lilac[500]}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ingredients, recipes..."
              placeholderTextColor={Colors.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color="white" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          <Pressable style={styles.addIngredientsButton}>
            <Text style={styles.addIngredientsText}>+ Add Ingredients</Text>
          </Pressable>
          {FILTER_OPTIONS.map((filter) => (
            <Pressable
              key={filter}
              style={[
                styles.filterChip,
                selectedFilters.includes(filter) && styles.filterChipActive,
              ]}
              onPress={() => toggleFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilters.includes(filter) &&
                    styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
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
            {recipes.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No recipes found</Text>
              </View>
            )}

            <View style={styles.gridContainer}>
              {recipes.map((recipe, index) => (
                <View key={recipe.id + index} style={styles.gridItem}>
                  <RecipeCard recipe={recipe} />
                </View>
              ))}
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.lilac[900]} />
                <Text style={styles.loadingText}>Loading recipes...</Text>
              </View>
            )}

            {error && !loading && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Error loading recipes. Please try again.
                </Text>
                <Pressable style={styles.retryButton} onPress={handleRefresh}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </Pressable>
              </View>
            )}

            {!hasMore && recipes.length > 0 && (
              <View style={styles.endContainer}>
                <Text style={styles.endText}>No more recipes</Text>
              </View>
            )}
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
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  filterButton: {
    backgroundColor: Colors.lilac[900],
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersContent: {
    gap: 8,
    paddingRight: 16,
  },
  addIngredientsButton: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  addIngredientsText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  filterChip: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  filterChipActive: {
    backgroundColor: Colors.lilac[900],
    borderColor: Colors.lilac[900],
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  filterChipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    paddingTop: 12,
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.lilac[900],
  },
  tabButtonInactive: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[300],
  },
  tabText: {
    textAlign: "center",
  },
  activeTabText: {
    color: Colors.lilac[900],
    fontWeight: "bold",
  },
  inactiveTabText: {
    color: Colors.gray[500],
  },
  discoverContainer: {
    marginTop: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: Colors.semantic.error.light,
    borderRadius: 12,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.semantic.error.dark,
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: Colors.semantic.error.main,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  endContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  endText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontStyle: "italic",
  },
});
