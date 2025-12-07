import { Colors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { Recipe } from "@/lib/spoonacular";
import CustomButton from "@/shared/components/custom-button";
import { findMacro, findNutrientValue } from "@/shared/utils/nutrition";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  FadeInDown,
  FadeOutUp,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SWIPE_THRESHOLD = 30;

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HERO_HEIGHT = 312;
const HEADER_HEIGHT = 56;

interface MealDetailContentProps {
  meal: Recipe;
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  onBack?: () => void;
  onPlanMeal?: () => void;
  mealSlot?: string;
}

const TAB_ITEMS = [
  { key: "ingredients", label: "Ingredients" },
  { key: "instructions", label: "Instructions" },
] as const;

type TabKey = (typeof TAB_ITEMS)[number]["key"];

interface MacroData {
  label: string;
  amountLabel: string;
  percentLabel: string;
  color: string;
  bgColor: string;
  iconBgColor: string;
  percentValue: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const MACRO_CONFIG: Record<
  string,
  {
    color: string;
    bgColor: string;
    iconBgColor: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }
> = {
  protein: {
    color: "#41D5B7",
    bgColor: "#E8FAF6",
    iconBgColor: "#C5F2E9",
    icon: "heart-pulse",
  },
  fat: {
    color: "#FCB205",
    bgColor: "#FFF8E5",
    iconBgColor: "#FFEDB8",
    icon: "water",
  },
  carbs: {
    color: "#CB8395",
    bgColor: "#F9F0F2",
    iconBgColor: "#F0D9DF",
    icon: "silverware-fork-knife",
  },
};

// Animated Nutrition Card Component
function NutritionCard({ macro, index }: { macro: MacroData; index: number }) {
  const progressWidth = useSharedValue(0);
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    // Smooth, subtle entrance animation
    cardOpacity.value = withDelay(index * 60, withTiming(1, { duration: 200 }));
    cardScale.value = withDelay(
      index * 60,
      withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) })
    );
    // Progress bar animation - smooth timing instead of spring
    progressWidth.value = withDelay(
      150 + index * 80,
      withTiming(macro.percentValue, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [macro.percentValue, index]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <Animated.View
      style={[
        styles.nutritionCard,
        { backgroundColor: macro.bgColor },
        cardAnimatedStyle,
      ]}
    >
      <View
        style={[
          styles.nutritionIconContainer,
          { backgroundColor: macro.iconBgColor },
        ]}
      >
        <MaterialCommunityIcons
          name={macro.icon}
          size={22}
          color={macro.color}
        />
      </View>
      <Text style={[styles.nutritionAmount, { color: macro.color }]}>
        {macro.amountLabel}
      </Text>
      <Text style={styles.nutritionLabel}>{macro.label}</Text>
      <View style={styles.nutritionProgressTrack}>
        <Animated.View
          style={[
            styles.nutritionProgressFill,
            { backgroundColor: macro.color },
            progressAnimatedStyle,
          ]}
        />
      </View>
      <Text style={[styles.nutritionPercent, { color: macro.color }]}>
        {macro.percentLabel}
      </Text>
    </Animated.View>
  );
}

export function MealDetailContent({
  meal,
  refreshing,
  onRefresh,
  isFavorited = false,
  onToggleFavorite,
  onBack,
  onPlanMeal,
}: MealDetailContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("ingredients");
  const insets = useSafeAreaInsets();
  const { selection } = useHaptics();
  const scrollY = useSharedValue(0);
  const tabProgress = useSharedValue(0);

  // Scroll threshold - when content title reaches header position
  const SCROLL_THRESHOLD = HERO_HEIGHT - (HEADER_HEIGHT + insets.top);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Hero image fade out animation
  const heroAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD * 0.6],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Header background fade in animation (synced with title)
  const headerBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.9, SCROLL_THRESHOLD * 1.1],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  // Header title slide in animation
  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.9, SCROLL_THRESHOLD * 1.1],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.9, SCROLL_THRESHOLD * 1.1],
      [10, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const nutrients = useMemo(
    () => meal.nutrition?.nutrients ?? [],
    [meal.nutrition?.nutrients]
  );
  const readyInMinutes = meal.readyInMinutes
    ? `${meal.readyInMinutes} min`
    : "N/A";
  const servingsCount = meal.servings ?? 1;
  const servingsText = `${servingsCount} ${
    servingsCount === 1 ? "serving" : "servings"
  }`;
  const calories = findNutrientValue("Calories", nutrients);
  const caloriesAmount =
    typeof calories?.amount === "number" ? Math.round(calories.amount) : null;

  const macros = useMemo<MacroData[]>(() => {
    const protein = findMacro("Protein", nutrients);
    const fat = findMacro("Fat", nutrients);
    const carbs = findMacro("Carbohydrates", nutrients);
    const totalGrams = protein.amount + fat.amount + carbs.amount || 1;

    const macroList = [
      {
        label: "Protein",
        key: "protein",
        amount: protein.amount,
        unit: protein.unit,
      },
      {
        label: "Fat",
        key: "fat",
        amount: fat.amount,
        unit: fat.unit,
      },
      {
        label: "Carbs",
        key: "carbs",
        amount: carbs.amount,
        unit: carbs.unit,
      },
    ];

    return macroList.map((macro) => {
      const config = MACRO_CONFIG[macro.key];
      const percentValue = Math.round((macro.amount / totalGrams) * 100);
      const normalizedUnit = macro.unit
        ? macro.unit.toLowerCase() === "g"
          ? "g"
          : macro.unit
        : "g";
      return {
        label: macro.label,
        amountLabel: `${Math.round(macro.amount)}${normalizedUnit}`,
        percentLabel: `${percentValue}%`,
        percentValue,
        color: config.color,
        bgColor: config.bgColor,
        iconBgColor: config.iconBgColor,
        icon: config.icon,
      };
    });
  }, [nutrients]);

  const instructions = useMemo(() => {
    const analyzed = meal.analyzedInstructions;
    if (Array.isArray(analyzed) && analyzed.length > 0) {
      const first = analyzed[0];
      const steps = Array.isArray(first?.steps) ? first.steps : [];
      return steps
        .map((step) => ({
          number: step.number,
          text: sanitizeText(step.step),
        }))
        .filter((step) => Boolean(step.text));
    }

    if (typeof meal.instructions === "string" && meal.instructions.length > 0) {
      return sanitizeText(meal.instructions)
        .split(/\r?\n|\.\s+/)
        .map((text, index) => ({
          number: index + 1,
          text: text.trim(),
        }))
        .filter((item) => Boolean(item.text));
    }

    return [];
  }, [meal.analyzedInstructions, meal.instructions]);

  const switchTab = useCallback(
    (tabKey: TabKey) => {
      if (tabKey === activeTab) return;

      selection();

      // Animate layout change - faster duration
      LayoutAnimation.configureNext({
        duration: 180,
        update: {
          type: LayoutAnimation.Types.easeOut,
        },
      });

      // Update tab progress for indicator animation - smooth easing without bounce
      tabProgress.value = withTiming(tabKey === "ingredients" ? 0 : 1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });

      setActiveTab(tabKey);
    },
    [activeTab, tabProgress]
  );

  const handleTabPress = useCallback(
    (tabKey: TabKey) => {
      switchTab(tabKey);
    },
    [switchTab]
  );

  // Swipe gesture for tab switching - more responsive
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-15, 15])
    .onEnd((event) => {
      const { translationX, velocityX } = event;

      // Swipe left -> go to instructions (lower threshold for faster response)
      if (
        (translationX < -SWIPE_THRESHOLD || velocityX < -300) &&
        activeTab === "ingredients"
      ) {
        runOnJS(switchTab)("instructions");
      }
      // Swipe right -> go to ingredients
      else if (
        (translationX > SWIPE_THRESHOLD || velocityX > 300) &&
        activeTab === "instructions"
      ) {
        runOnJS(switchTab)("ingredients");
      }
    });

  // Tab indicator animated style - snappier, using interpolate for smooth transition
  const tabIndicatorStyle = useAnimatedStyle(() => {
    const leftPercent = interpolate(
      tabProgress.value,
      [0, 1],
      [0, 50],
      Extrapolation.CLAMP
    );
    return {
      left: `${leftPercent}%`,
    };
  });

  // Ingredients tab animated style
  const ingredientsTabStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      tabProgress.value,
      [0, 1],
      [1, 0.95],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  // Instructions tab animated style
  const instructionsTabStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      tabProgress.value,
      [0, 1],
      [0.95, 1],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, { paddingTop: insets.top }]}>
        {/* Header Background (fades in on scroll) */}
        <Animated.View
          style={[
            styles.headerBackground,
            { height: HEADER_HEIGHT + insets.top },
            headerBackgroundStyle,
          ]}
        />

        {/* Header Content */}
        <View style={styles.headerContent}>
          {/* Back Button */}
          {onBack && (
            <CustomButton
              onPress={onBack}
              containerStyle={styles.headerButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <View style={styles.iconButton}>
                <Ionicons name="chevron-back" size={24} color="#312A35" />
              </View>
            </CustomButton>
          )}

          {/* Header Title (slides in on scroll) */}
          <Animated.View
            style={[styles.headerTitleContainer, headerTitleStyle]}
          >
            <Text style={styles.headerTitle} numberOfLines={1}>
              {meal.title}
            </Text>
          </Animated.View>

          {/* Favorite Button */}
          {onToggleFavorite && (
            <CustomButton
              onPress={onToggleFavorite}
              containerStyle={styles.headerButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={
                isFavorited ? "Remove from favorites" : "Add to favorites"
              }
              accessibilityRole="button"
            >
              <View style={styles.iconButton}>
                <Ionicons
                  name={isFavorited ? "heart" : "heart-outline"}
                  size={24}
                  color="#F03E3E"
                />
              </View>
            </CustomButton>
          )}
        </View>
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.lilac[800]}
            colors={[Colors.lilac[800]]}
            progressViewOffset={HEADER_HEIGHT + insets.top}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image (extends under header, fades out on scroll) */}
        <Animated.View style={[styles.heroWrapper, heroAnimatedStyle]}>
          <Image
            source={
              meal.image
                ? { uri: meal.image }
                : require("@/assets/images/meal-plan-hero.png")
            }
            style={styles.heroImage}
            contentFit="fill"
            transition={200}
            accessibilityLabel={`${meal.title} hero image`}
          />
        </Animated.View>

        <View style={styles.sheet}>
          <Text style={styles.title} accessibilityRole="header">
            {meal.title}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Image
                source={require("@/assets/icons/clock-icon.svg")}
                style={styles.metaIcon}
                contentFit="contain"
              />
              <Text style={styles.metaText}>{readyInMinutes}</Text>
            </View>
            <Text style={styles.metaSeparator}>|</Text>
            <View style={styles.metaItem}>
              <Image
                source={require("@/assets/icons/flame-icon.svg")}
                style={styles.metaIcon}
                contentFit="contain"
              />
              <Text style={styles.metaText}>
                {caloriesAmount !== null ? `${caloriesAmount} kcal` : "—"}
              </Text>
            </View>
            <Text style={styles.metaSeparator}>|</Text>
            <View style={styles.metaItem}>
              <Ionicons
                name="people-outline"
                size={18}
                color={Colors.gray[600]}
              />
              <Text style={styles.metaText}>{servingsText}</Text>
            </View>
          </View>

          {/* Cuisine and Diet Tags */}
          {meal.cuisines?.length || meal.diets?.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tagsScrollView}
              contentContainerStyle={styles.tagsContainer}
            >
              {meal.cuisines?.map((cuisine) => (
                <View key={cuisine} style={styles.cuisineTag}>
                  <Text style={styles.cuisineTagText}>{cuisine}</Text>
                </View>
              ))}
              {meal.diets?.map((diet) => (
                <View key={diet} style={styles.dietTag}>
                  <Text style={styles.dietTagText}>{diet}</Text>
                </View>
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nutrition</Text>
          </View>

          <View style={styles.nutritionCardsWrapper}>
            {macros.map((macro, index) => (
              <NutritionCard key={macro.label} macro={macro} index={index} />
            ))}
          </View>

          {/* Modern Underline Tab Bar */}
          <View style={styles.tabsOuterContainer}>
            <View style={styles.tabsContainer} accessibilityRole="tablist">
              <Pressable
                onPress={() => handleTabPress("ingredients")}
                style={styles.tabButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="tab"
              >
                <Animated.View style={[styles.tabInner, ingredientsTabStyle]}>
                  <Ionicons
                    name="leaf"
                    size={18}
                    color={
                      activeTab === "ingredients"
                        ? Colors.lilac[800]
                        : Colors.gray[400]
                    }
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      activeTab === "ingredients"
                        ? styles.tabLabelActive
                        : styles.tabLabelInactive,
                    ]}
                  >
                    Ingredients
                  </Text>
                </Animated.View>
              </Pressable>
              <Pressable
                onPress={() => handleTabPress("instructions")}
                style={styles.tabButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="tab"
              >
                <Animated.View style={[styles.tabInner, instructionsTabStyle]}>
                  <Ionicons
                    name="reader-outline"
                    size={18}
                    color={
                      activeTab === "instructions"
                        ? Colors.lilac[800]
                        : Colors.gray[400]
                    }
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      activeTab === "instructions"
                        ? styles.tabLabelActive
                        : styles.tabLabelInactive,
                    ]}
                  >
                    Instructions
                  </Text>
                </Animated.View>
              </Pressable>
            </View>
            {/* Animated Underline */}
            <View style={styles.tabUnderlineTrack}>
              <Animated.View style={[styles.tabUnderline, tabIndicatorStyle]} />
            </View>
          </View>

          {/* Tab Content - Swipeable with modern card design */}
          <GestureDetector gesture={swipeGesture}>
            <View style={styles.tabContentWrapper}>
              {activeTab === "ingredients" ? (
                <View key="ingredients" style={styles.contentSection}>
                  {/* Header with staggered animation */}
                  <Animated.View
                    entering={FadeInDown.duration(200).delay(0)}
                    exiting={FadeOutUp.duration(100)}
                    style={styles.contentHeader}
                  >
                    <View style={styles.contentHeaderIcon}>
                      <Ionicons
                        name="leaf-outline"
                        size={16}
                        color={Colors.lilac[700]}
                      />
                    </View>
                    <Text style={styles.contentHeaderTitle}>
                      {(meal.extendedIngredients ?? []).length} Ingredients
                    </Text>
                  </Animated.View>
                  <View style={styles.ingredientsList}>
                    {(meal.extendedIngredients ?? []).map(
                      (ingredient, index, arr) => (
                        <Animated.View
                          key={`${ingredient.id}-${ingredient.original}-${index}`}
                          entering={FadeInDown.duration(200).delay(
                            50 + index * 30
                          )}
                          exiting={FadeOutUp.duration(80)}
                          style={styles.ingredientCard}
                        >
                          <View style={styles.ingredientIconWrapper}>
                            <View style={styles.ingredientIcon} />
                            {index < arr.length - 1 && (
                              <View style={styles.ingredientConnector} />
                            )}
                          </View>
                          <View style={styles.ingredientContent}>
                            <Text style={styles.ingredientText}>
                              {ingredient.original}
                            </Text>
                          </View>
                        </Animated.View>
                      )
                    )}
                    {(!meal.extendedIngredients ||
                      meal.extendedIngredients.length === 0) && (
                      <Animated.View
                        entering={FadeInDown.duration(200).delay(50)}
                        style={styles.emptyState}
                      >
                        <Ionicons
                          name="basket-outline"
                          size={48}
                          color={Colors.gray[300]}
                        />
                        <Text style={styles.emptyText}>
                          No ingredients available
                        </Text>
                      </Animated.View>
                    )}
                  </View>
                </View>
              ) : (
                <View key="instructions" style={styles.contentSection}>
                  {/* Header with staggered animation */}
                  <Animated.View
                    entering={FadeInDown.duration(200).delay(0)}
                    exiting={FadeOutUp.duration(100)}
                    style={styles.contentHeader}
                  >
                    <View style={styles.contentHeaderIcon}>
                      <Ionicons
                        name="list-outline"
                        size={16}
                        color={Colors.lilac[700]}
                      />
                    </View>
                    <Text style={styles.contentHeaderTitle}>
                      {instructions.length} Steps
                    </Text>
                  </Animated.View>
                  <View style={styles.instructionsList}>
                    {instructions.length > 0 ? (
                      instructions.map((step, index) => (
                        <Animated.View
                          key={step.number}
                          entering={FadeInDown.duration(200).delay(
                            50 + index * 40
                          )}
                          exiting={FadeOutUp.duration(80)}
                          style={styles.stepCard}
                        >
                          <View style={styles.stepNumberContainer}>
                            <View style={styles.stepBadge}>
                              <Text style={styles.stepBadgeText}>
                                {step.number}
                              </Text>
                            </View>
                            {index < instructions.length - 1 && (
                              <View style={styles.stepConnector} />
                            )}
                          </View>
                          <View style={styles.stepContent}>
                            <Text style={styles.stepText}>{step.text}</Text>
                          </View>
                        </Animated.View>
                      ))
                    ) : (
                      <Animated.View
                        entering={FadeInDown.duration(200).delay(50)}
                        style={styles.emptyState}
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={48}
                          color={Colors.gray[300]}
                        />
                        <Text style={styles.emptyText}>
                          No instructions available
                        </Text>
                      </Animated.View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </GestureDetector>
        </View>

        {!!onPlanMeal && (
          <View style={styles.planCtaWrapper}>
            <CustomButton
              onPress={onPlanMeal}
              containerStyle={styles.planButton}
              accessibilityRole="button"
              accessibilityLabel="Plan this meal"
            >
              <Text style={styles.planButtonText}>Plan this meal</Text>
            </CustomButton>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

function sanitizeText(value: string | undefined) {
  if (!value) {
    return "";
  }
  return value.replace(/<\/?[^>]+(>|$)/g, "").trim();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: HEADER_HEIGHT,
    paddingHorizontal: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroWrapper: {
    width: "100%",
    height: HERO_HEIGHT,
    backgroundColor: Colors.gray[100],
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(242, 240, 244, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },

  sheet: {
    marginTop: -21,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: Colors.background.surface,
    gap: 16,
  },
  title: {
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaIcon: {
    width: 18,
    height: 18,
  },
  metaText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[600],
  },
  metaSeparator: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[400],
  },
  tagsScrollView: {
    marginTop: 16,
    flexGrow: 0,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16,
  },
  cuisineTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lilac[100],
    borderWidth: 1,
    borderColor: Colors.lilac[300],
  },
  cuisineTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.lilac[900],
  },
  dietTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.green[100],
    borderWidth: 1,
    borderColor: Colors.green[300],
  },
  dietTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.green[900],
  },
  sectionHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    lineHeight: 22,
  },
  nutritionCardsWrapper: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  nutritionCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    gap: 2,
  },
  nutritionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  nutritionAmount: {
    fontFamily: "Inter",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 24,
  },
  nutritionLabel: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "500",
    color: Colors.gray[600],
    lineHeight: 16,
  },
  nutritionProgressTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginTop: 6,
    overflow: "hidden",
  },
  nutritionProgressFill: {
    height: "100%",
    borderRadius: 2.5,
  },
  nutritionPercent: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 2,
  },
  tabsOuterContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabUnderlineTrack: {
    height: 3,
    backgroundColor: Colors.gray[100],
    borderRadius: 2,
    marginTop: 12,
    overflow: "hidden",
  },
  tabUnderline: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: Colors.lilac[700],
    borderRadius: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  tabLabel: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: Colors.lilac[800],
  },
  tabLabelInactive: {
    color: Colors.gray[400],
  },
  tabContentWrapper: {
    minHeight: 100,
    marginTop: 1,
  },
  contentSection: {
    gap: 7,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contentHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.lilac[100],
    alignItems: "center",
    justifyContent: "center",
  },
  contentHeaderTitle: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: 0.3,
  },
  ingredientsList: {
    gap: 0,
  },
  ingredientCard: {
    flexDirection: "row",
    gap: 12,
  },
  ingredientIconWrapper: {
    alignItems: "center",
    width: 26,
  },
  ingredientIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lilac[700],
    marginTop: 6,
  },
  ingredientConnector: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.lilac[100],
    marginTop: 4,
    borderRadius: 1,
  },
  ingredientContent: {
    flex: 1,
    paddingBottom: 16,
  },
  ingredientText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[700],
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "500",
    color: Colors.gray[400],
    textAlign: "center",
  },
  instructionsList: {
    gap: 2,
  },
  stepCard: {
    flexDirection: "row",
    gap: 12,
  },
  stepNumberContainer: {
    alignItems: "center",
    width: 26,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lilac[800],
  },
  stepBadgeText: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "600",
    color: Colors.background.surface,
  },
  stepConnector: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.lilac[100],
    marginVertical: 4,
    borderRadius: 1,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stepText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[700],
    lineHeight: 20,
  },
  planCtaWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  planButton: {
    backgroundColor: Colors.lilac[900],
    borderRadius: 16,
    paddingVertical: 14,
  },
  planButtonText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "600",
    color: Colors.background.surface,
  },
});
