import { Colors } from "@/constants/theme";
import { useFavoriteRecipes } from "@/features/home/hooks/use-favorite-recipes";
import { Recipe } from "@/lib/spoonacular";
import { getMealImageUrl, type Meal } from "@/lib/utils";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  runOnUI,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface MealSelectionModalHandle {
  present: () => void;
  dismiss: () => void;
}

interface MealSelectionModalProps {
  title?: string;
  meals: Meal[];
  selectedIndex?: number;
  onSelect: (meal: Meal) => void;
  onDismiss?: () => void;
  onGenerateMore?: () => void;
  isGeneratingMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMorePages?: boolean;
}

export const MealSelectionModal = forwardRef<
  MealSelectionModalHandle,
  MealSelectionModalProps
>(
  (
    {
      title,
      meals,
      selectedIndex,
      onSelect,
      onDismiss,
      onGenerateMore,
      isGeneratingMore,
      onLoadMore,
      isLoadingMore,
      hasMorePages,
    },
    ref
  ) => {
    const internalRef = useRef<BottomSheetModal>(null);
    const horizontalPagerRef = useAnimatedRef<Animated.ScrollView>();
    const scrollX = useSharedValue(0);
    const { top, bottom } = useSafeAreaInsets();
    const screenHeight =
      Dimensions.get("screen").height - top - (Platform.OS === "ios" ? 24 : 0);
    const screenWidth = Dimensions.get("window").width;
    const contentWidth = screenWidth - 40; // 20 padding on each side

    const [activeTab, setActiveTab] = useState<"suggestions" | "favorites">(
      "suggestions"
    );

    const handleTabChange = useCallback(
      async (tab: "suggestions" | "favorites") => {
        if (tab === activeTab) {
          return;
        }
        const pageIndex = tab === "suggestions" ? 0 : 1;
        setActiveTab(tab);
        // Use Reanimated's scrollTo for animated refs
        runOnUI(() => {
          "worklet";
          scrollTo(horizontalPagerRef, pageIndex * contentWidth, 0, true);
        })();
        await Haptics.selectionAsync();
      },
      [activeTab, contentWidth, horizontalPagerRef]
    );

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollX.value = event.contentOffset.x;
      },
    });

    const handleMomentumScrollEnd = useCallback(
      (event: any) => {
        const { contentOffset, layoutMeasurement } = event.nativeEvent;
        const pageIndex = Math.round(contentOffset.x / layoutMeasurement.width);
        const newTab = pageIndex === 0 ? "suggestions" : "favorites";

        if (newTab !== activeTab) {
          setActiveTab(newTab);
          Haptics.selectionAsync();
        }
      },
      [activeTab]
    );

    const { favorites } = useFavoriteRecipes();

    const favoriteMeals: Meal[] = useMemo(() => {
      return favorites.map((recipe: Recipe) => {
        const nutrients = recipe.nutrition?.nutrients;
        const calories = nutrients?.find((n) => n.name === "Calories")?.amount;
        const carbs = nutrients?.find(
          (n) => n.name === "Carbohydrates"
        )?.amount;
        const protein = nutrients?.find((n) => n.name === "Protein")?.amount;
        const fat = nutrients?.find((n) => n.name === "Fat")?.amount;
        return {
          id: recipe.id,
          title: recipe.title,
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          image: recipe.image,
          sourceUrl: recipe.sourceUrl,
          nutrition: {
            calories,
            carbs,
            protein,
            fat,
          },
        };
      });
    }, [favorites]);

    // Match IngredientModal: use 95% and fixed sizing
    const snapPoints = useMemo(() => ["95%"], []);
    const safeSelectedIndex =
      selectedIndex && selectedIndex >= meals.length ? 0 : selectedIndex;

    const handleBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      []
    );

    useImperativeHandle(
      ref,
      () => ({
        present: () => {
          // Reset to suggestions tab when modal opens
          setActiveTab("suggestions");
          // Reset scroll position to suggestions page
          runOnUI(() => {
            "worklet";
            scrollTo(horizontalPagerRef, 0, 0, false);
          })();
          internalRef.current?.present();
        },
        dismiss: () => internalRef.current?.dismiss(),
      }),
      [horizontalPagerRef]
    );

    const renderMealCard = useCallback(
      ({ item, index }: { item: Meal; index: number }) => {
        const isSelected =
          activeTab === "suggestions" && index === safeSelectedIndex;
        const imageUrl = getMealImageUrl(item);

        return (
          <Pressable
            onPress={() => onSelect(item)}
            style={({ pressed }) => [
              styles.mealCard,
              isSelected && styles.mealCardSelected,
              pressed && styles.mealCardPressed,
            ]}
          >
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.mealImage} />
            ) : (
              <View style={[styles.mealImage, styles.mealPlaceholder]} />
            )}
            <View style={styles.mealInfo}>
              <Text numberOfLines={2} style={styles.mealTitle}>
                {item.title}
              </Text>
              <View style={styles.mealMeta}>
                {item.nutrition?.calories && (
                  <Text style={styles.metaText}>
                    {Math.round(item.nutrition.calories)} cal
                  </Text>
                )}
                {item.readyInMinutes && (
                  <Text style={styles.metaText}>{item.readyInMinutes} min</Text>
                )}
              </View>
            </View>
            {isSelected && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            )}
          </Pressable>
        );
      },
      [onSelect, safeSelectedIndex, activeTab]
    );

    const renderLoadMoreFooter = useCallback(() => {
      if (!onLoadMore || !hasMorePages) return null;

      return (
        <View style={styles.loadMoreContainer}>
          <Pressable
            onPress={onLoadMore}
            disabled={isLoadingMore}
            style={({ pressed }) => [
              styles.loadMoreButton,
              pressed && { opacity: 0.8 },
              isLoadingMore && styles.loadMoreButtonDisabled,
            ]}
          >
            {isLoadingMore ? (
              <ActivityIndicator color={Colors.lilac[900]} size="small" />
            ) : (
              <>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={Colors.lilac[900]}
                />
                <Text style={styles.loadMoreText}>Load more recipes</Text>
              </>
            )}
          </Pressable>
        </View>
      );
    }, [onLoadMore, isLoadingMore, hasMorePages]);

    const renderList = useCallback(
      (data: Meal[], type: "suggestions" | "favorites") => {
        const hasData = data.length > 0;

        if (hasData) {
          return (
            <BottomSheetFlatList
              data={data}
              renderItem={renderMealCard}
              keyExtractor={(item: Meal) => String(item.id)}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={[
                styles.gridContainer,
                type === "suggestions" &&
                  onGenerateMore && { paddingBottom: 80 },
              ]}
              ListFooterComponent={
                type === "suggestions" ? renderLoadMoreFooter : undefined
              }
              removeClippedSubviews
              windowSize={5}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              updateCellsBatchingPeriod={50}
              showsVerticalScrollIndicator={false}
            />
          );
        }

        return (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="restaurant-menu"
              size={48}
              color={Colors.gray[300]}
            />
            <Text style={styles.emptyText}>
              {type === "favorites"
                ? "No favorite recipes yet"
                : "No recipes found for this meal"}
            </Text>
            {type === "suggestions" && onGenerateMore && (
              <Pressable
                onPress={onGenerateMore}
                disabled={isGeneratingMore}
                style={({ pressed }) => [
                  styles.emptyAiButton,
                  pressed && styles.mealCardPressed,
                  isGeneratingMore && styles.generateCardDisabled,
                ]}
              >
                {isGeneratingMore ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="auto-awesome" size={18} color="#fff" />
                    <Text style={styles.emptyAiButtonText}>
                      Generate with AI
                    </Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        );
      },
      [renderMealCard, renderLoadMoreFooter, onGenerateMore, isGeneratingMore]
    );

    return (
      <BottomSheetModal
        ref={internalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={handleBackdrop}
        enableOverDrag={false}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        onDismiss={() => onDismiss?.()}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View
          style={[
            styles.container,
            { height: screenHeight, paddingBottom: bottom + 16 },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>{title ?? "Select a meal"}</Text>
              <Pressable onPress={() => internalRef.current?.dismiss()}>
                <AntDesign name="close" size={20} color={Colors.text.primary} />
              </Pressable>
            </View>

            <View style={styles.tabsContainer}>
              <Pressable
                style={[
                  styles.tab,
                  activeTab === "suggestions" && styles.activeTab,
                ]}
                onPress={() => handleTabChange("suggestions")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "suggestions" && styles.activeTabText,
                  ]}
                >
                  Suggestions
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.tab,
                  activeTab === "favorites" && styles.activeTab,
                ]}
                onPress={() => handleTabChange("favorites")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "favorites" && styles.activeTabText,
                  ]}
                >
                  Favorites
                </Text>
              </Pressable>
            </View>
          </View>

          <Animated.ScrollView
            ref={horizontalPagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
            contentContainerStyle={{ width: contentWidth * 2 }}
          >
            <View style={{ width: contentWidth, height: "100%" }}>
              {renderList(meals, "suggestions")}
            </View>
            <View style={{ width: contentWidth, height: "100%" }}>
              {renderList(favoriteMeals, "favorites")}
            </View>
          </Animated.ScrollView>

          {/* Sticky Footer - Generate with AI */}
          {activeTab === "suggestions" &&
            meals.length > 0 &&
            onGenerateMore && (
              <View style={[styles.stickyFooter, { paddingBottom: bottom }]}>
                <Pressable
                  onPress={onGenerateMore}
                  disabled={isGeneratingMore}
                  style={({ pressed }) => [
                    styles.stickyFooterButton,
                    pressed && { opacity: 0.9 },
                    isGeneratingMore && styles.generateCardDisabled,
                  ]}
                >
                  {isGeneratingMore ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <MaterialIcons
                        name="auto-awesome"
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.stickyFooterButtonText}>
                        Generate with AI
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
        </View>
      </BottomSheetModal>
    );
  }
);

MealSelectionModal.displayName = "MealSelectionModal";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 12, android: 4 }),
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "column",
    marginBottom: 20,
    gap: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.gray[100],
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.text.primary,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  gridContainer: {
    paddingBottom: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  mealCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  mealCardSelected: {
    borderColor: Colors.lilac[500],
  },
  mealCardPressed: {
    transform: [{ scale: 0.97 }],
  },
  mealImage: {
    width: "100%",
    height: 110,
    backgroundColor: Colors.gray[200],
  },
  mealPlaceholder: {
    backgroundColor: Colors.gray[300],
  },
  mealInfo: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  mealMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  checkmark: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.lilac[500],
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: 8,
  },
  emptyAiButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.lilac[900],
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyAiButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  handleIndicator: {
    backgroundColor: Colors.gray[300],
  },
  generateCardDisabled: {
    opacity: 0.7,
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  stickyFooterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.lilac[900],
    paddingVertical: 14,
    borderRadius: 12,
  },
  stickyFooterButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  loadMoreContainer: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lilac[900],
    backgroundColor: "#fff",
  },
  loadMoreButtonDisabled: {
    opacity: 0.6,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.lilac[900],
  },
});
