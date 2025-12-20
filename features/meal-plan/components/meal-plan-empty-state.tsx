import { Colors, getThemeColors } from "@/constants/theme";
import {
  SuggestedRecipe,
  useSuggestedRecipes,
} from "@/hooks/use-suggested-recipes";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/providers/theme-provider";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface MealPlanEmptyStateProps {
  onCreatePress: () => void;
}

// Fallback recipes when API fails
const FALLBACK_RECIPES: SuggestedRecipe[] = [
  {
    id: 716429,
    title: "Pasta with Garlic",
    tag: "Pasta",
    readyInMinutes: 25,
    calories: 380,
    image: "https://img.spoonacular.com/recipes/716429-312x231.jpg",
    source: "random",
  },
  {
    id: 715538,
    title: "Bruschetta Style Pork",
    tag: "Pork",
    readyInMinutes: 35,
    calories: 420,
    image: "https://img.spoonacular.com/recipes/715538-312x231.jpg",
    source: "random",
  },
  {
    id: 716426,
    title: "Cauliflower Tacos",
    tag: "Cauliflower",
    readyInMinutes: 30,
    calories: 290,
    image: "https://img.spoonacular.com/recipes/716426-312x231.jpg",
    source: "random",
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MealPlanEmptyState({ onCreatePress }: MealPlanEmptyStateProps) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const ThemeColors = getThemeColors(isDark, true);

  // Fetch dynamic suggested recipes
  const { data: suggestedRecipes, isLoading: isLoadingSuggestions } =
    useSuggestedRecipes();

  // Use fetched recipes or fallback
  const recipes =
    suggestedRecipes && suggestedRecipes.length > 0
      ? suggestedRecipes
      : FALLBACK_RECIPES;

  const quickAddScale = useSharedValue(1);
  const discoverScale = useSharedValue(1);
  const aiScale = useSharedValue(1);

  const quickAddAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: quickAddScale.value }],
  }));

  const discoverAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: discoverScale.value }],
  }));

  const aiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: aiScale.value }],
  }));

  const handleQuickAddPress = () => {
    onCreatePress();
  };

  const handleDiscoverPress = () => {
    router.push("/(app)/recipes");
  };

  const handleAIPress = () => {
    router.push("/ai-recipe");
  };

  const handleViewAll = () => {
    router.push("/(app)/recipes");
  };

  const handleRecipePress = (recipeId: number) => {
    router.push({
      pathname: "/(meal)/[id]",
      params: { id: recipeId.toString() },
    });
  };

  return (
    <View style={styles.container}>
      {/* Hero Card */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={[
          styles.heroCard,
          {
            backgroundColor: isDark
              ? ThemeColors.background.tertiary
              : Colors.lilac[100],
            borderColor: isDark ? ThemeColors.border.light : Colors.lilac[200],
          },
        ]}
      >
        {/* Decorative blurs */}
        <View
          style={[
            styles.decorativeBlur1,
            {
              backgroundColor: isDark
                ? Colors.lilac[900] + "15"
                : Colors.lilac[300] + "30",
            },
          ]}
        />
        {!isDark && (
          <View
            style={[
              styles.decorativeBlur2,
              {
                backgroundColor: Colors.green[300] + "30",
              },
            ]}
          />
        )}

        <View style={styles.heroContent}>
          <View style={styles.heroTextContainer}>
            <Text
              style={[
                styles.heroTitle,
                {
                  color: isDark
                    ? ThemeColors.text.primary
                    : Colors.text.primary,
                },
              ]}
            >
              {t("mealPlan.emptyTitle")}{" "}
              <Text
                style={[
                  styles.heroTitleHighlight,
                  { color: Colors.lilac[700] },
                ]}
              >
                {t("mealPlan.emptyTitleHighlight")}
              </Text>{" "}
              {t("mealPlan.emptyTitleEnd")}
            </Text>
            <Text
              style={[
                styles.heroSubtitle,
                {
                  color: isDark
                    ? ThemeColors.text.secondary
                    : Colors.text.tertiary,
                },
              ]}
            >
              {t("mealPlan.emptySubtitle")}
            </Text>
          </View>
          <View style={styles.heroImageContainer}>
            <Image
              source={require("@/assets/images/meal-plan-hero.png")}
              style={styles.heroImage}
              contentFit="contain"
            />
          </View>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        style={styles.actionButtonsContainer}
      >
        {/* Quick Add Meal Button */}
        <AnimatedPressable
          style={[styles.primaryButton, quickAddAnimatedStyle]}
          onPress={handleQuickAddPress}
          onPressIn={() => {
            quickAddScale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            quickAddScale.value = withSpring(1);
          }}
        >
          <View style={styles.buttonIconContainer}>
            <Ionicons name="add" size={24} color="#fff" />
          </View>
          <Text style={styles.primaryButtonText}>
            {t("mealPlan.quickAddMeal")}
          </Text>
        </AnimatedPressable>

        {/* Discover Recipes Button */}
        <AnimatedPressable
          style={[
            styles.secondaryButton,
            discoverAnimatedStyle,
            {
              backgroundColor: isDark
                ? ThemeColors.background.surface
                : Colors.background.surface,
              borderColor: isDark
                ? ThemeColors.border.light
                : Colors.border.light,
            },
          ]}
          onPress={handleDiscoverPress}
          onPressIn={() => {
            discoverScale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            discoverScale.value = withSpring(1);
          }}
        >
          <View
            style={[
              styles.secondaryIconContainer,
              {
                backgroundColor: isDark
                  ? Colors.lilac[900] + "20"
                  : Colors.lilac[100],
              },
            ]}
          >
            <MaterialIcons
              name="restaurant-menu"
              size={20}
              color={Colors.lilac[700]}
            />
          </View>
          <Text
            style={[
              styles.secondaryButtonText,
              {
                color: isDark ? ThemeColors.text.primary : Colors.text.primary,
              },
            ]}
          >
            {t("mealPlan.discoverRecipes")}
          </Text>
        </AnimatedPressable>
      </Animated.View>

      {/* AI Generate Button */}
      <Animated.View entering={FadeInDown.duration(400).delay(300)}>
        <AnimatedPressable
          style={[
            styles.aiButton,
            aiAnimatedStyle,
            {
              backgroundColor: isDark
                ? ThemeColors.background.tertiary
                : Colors.lilac[100] + "60",
            },
          ]}
          onPress={handleAIPress}
          onPressIn={() => {
            aiScale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            aiScale.value = withSpring(1);
          }}
        >
          <MaterialIcons
            name="auto-awesome"
            size={16}
            color={isDark ? Colors.lilac[400] : Colors.lilac[600]}
          />
          <Text
            style={[
              styles.aiButtonText,
              { color: isDark ? Colors.lilac[400] : Colors.lilac[600] },
            ]}
          >
            {t("mealPlan.generateWithAI")}
          </Text>
        </AnimatedPressable>
      </Animated.View>

      {/* Suggested Recipes Section */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(400)}
        style={styles.suggestedSection}
      >
        <View style={styles.suggestedHeader}>
          <Text
            style={[
              styles.suggestedTitle,
              {
                color: isDark ? ThemeColors.text.primary : Colors.text.primary,
              },
            ]}
          >
            {t("mealPlan.suggestedForYou")}
          </Text>
          <Pressable onPress={handleViewAll}>
            <Text style={[styles.viewAllText, { color: Colors.lilac[700] }]}>
              {t("mealPlan.viewAll")}
            </Text>
          </Pressable>
        </View>

        {isLoadingSuggestions ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedScrollContent}
            style={styles.suggestedScroll}
          >
            {[1, 2, 3].map((_, index) => (
              <RecipeCardSkeleton key={index} isDark={isDark} index={index} />
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedScrollContent}
            style={styles.suggestedScroll}
          >
            {recipes.map((recipe, index) => (
              <Animated.View
                key={recipe.id}
                entering={FadeInRight.duration(400).delay(500 + index * 100)}
              >
                <SuggestedRecipeCard
                  recipe={recipe}
                  isDark={isDark}
                  t={t}
                  onPress={() => handleRecipePress(recipe.id)}
                />
              </Animated.View>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

// Skeleton Card Component
interface RecipeCardSkeletonProps {
  isDark: boolean;
  index: number;
}

function RecipeCardSkeleton({ isDark, index }: RecipeCardSkeletonProps) {
  const ThemeColors = getThemeColors(isDark, true);
  const shimmerOpacity = useSharedValue(0.3);

  useEffect(() => {
    shimmerOpacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  const skeletonBg = isDark ? ThemeColors.border.light : Colors.gray[100];

  return (
    <Animated.View
      entering={FadeInRight.duration(300).delay(index * 100)}
      style={[
        styles.recipeCard,
        {
          backgroundColor: isDark
            ? ThemeColors.background.surface
            : Colors.background.surface,
          borderColor: isDark ? ThemeColors.border.light : Colors.border.light,
        },
      ]}
    >
      {/* Image skeleton */}
      <Animated.View
        style={[
          styles.recipeImageContainer,
          { backgroundColor: skeletonBg },
          shimmerStyle,
        ]}
      >
        {/* Tag skeleton */}
        <Animated.View
          style={[
            styles.skeletonTag,
            { backgroundColor: isDark ? Colors.gray[600] : Colors.gray[200] },
            shimmerStyle,
          ]}
        />
      </Animated.View>

      {/* Info skeleton */}
      <View style={styles.recipeInfo}>
        {/* Title skeleton */}
        <Animated.View
          style={[
            styles.skeletonTitle,
            { backgroundColor: skeletonBg },
            shimmerStyle,
          ]}
        />
        {/* Meta skeleton */}
        <View style={styles.recipeMeta}>
          <Animated.View
            style={[
              styles.skeletonMeta,
              { backgroundColor: skeletonBg },
              shimmerStyle,
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

// Suggested Recipe Card Component
interface SuggestedRecipeCardProps {
  recipe: SuggestedRecipe;
  isDark: boolean;
  t: (key: string) => string;
  onPress: () => void;
}

function SuggestedRecipeCard({
  recipe,
  isDark,
  t,
  onPress,
}: SuggestedRecipeCardProps) {
  const ThemeColors = getThemeColors(isDark, true);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Get tag color based on source
  const getTagColors = () => {
    switch (recipe.source) {
      case "pantry":
        return {
          bg: isDark ? Colors.green[800] : Colors.green[100],
          text: isDark ? Colors.green[100] : Colors.green[800],
        };
      case "recent":
        return {
          bg: isDark ? Colors.lilac[800] : Colors.lilac[100],
          text: isDark ? Colors.lilac[100] : Colors.lilac[800],
        };
      default:
        return {
          bg: isDark ? Colors.beige[800] : Colors.beige[200],
          text: isDark ? Colors.beige[100] : Colors.beige[900],
        };
    }
  };

  const tagColors = getTagColors();

  return (
    <AnimatedPressable
      style={[
        styles.recipeCard,
        animatedStyle,
        {
          backgroundColor: isDark
            ? ThemeColors.background.surface
            : Colors.background.surface,
          borderColor: isDark ? ThemeColors.border.light : Colors.border.light,
        },
      ]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    >
      <View style={styles.recipeImageContainer}>
        <Image
          source={{ uri: recipe.image }}
          style={styles.recipeImage}
          contentFit="cover"
        />
        {recipe.tag && (
          <View style={[styles.recipeTag, { backgroundColor: tagColors.bg }]}>
            <Text style={[styles.recipeTagText, { color: tagColors.text }]}>
              {recipe.tag}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.recipeInfo}>
        <Text
          style={[
            styles.recipeTitle,
            {
              color: isDark ? ThemeColors.text.primary : Colors.text.primary,
            },
          ]}
          numberOfLines={1}
        >
          {recipe.title}
        </Text>
        <View style={styles.recipeMeta}>
          <MaterialIcons
            name="schedule"
            size={12}
            color={isDark ? Colors.lilac[400] : Colors.lilac[600]}
          />
          <Text
            style={[
              styles.recipeMetaText,
              {
                color: isDark
                  ? ThemeColors.text.tertiary
                  : Colors.text.tertiary,
              },
            ]}
          >
            {recipe.readyInMinutes} {t("mealPlan.minutes")}
          </Text>
          <Text
            style={[
              styles.recipeMetaDot,
              {
                color: isDark ? ThemeColors.text.tertiary : Colors.gray[300],
              },
            ]}
          >
            •
          </Text>
          <Text
            style={[
              styles.recipeMetaText,
              {
                color: isDark
                  ? ThemeColors.text.tertiary
                  : Colors.text.tertiary,
              },
            ]}
          >
            {recipe.calories} {t("mealPlan.kcal")}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  // Hero Card
  heroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  decorativeBlur1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  decorativeBlur2: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 1,
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
    marginBottom: 8,
  },
  heroTitleHighlight: {
    fontWeight: "700",
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroImageContainer: {
    width: 96,
    height: 96,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.lilac[900],
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.lilac[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // AI Button
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 16,
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  // Suggested Section
  suggestedSection: {
    marginTop: 24,
  },
  suggestedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  suggestedTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "500",
  },
  loadingContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestedScroll: {
    marginHorizontal: -16,
  },
  suggestedScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  // Recipe Card
  recipeCard: {
    width: 160,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  recipeImageContainer: {
    height: 112,
    position: "relative",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  recipeTag: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recipeTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  recipeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  recipeMetaText: {
    fontSize: 10,
  },
  recipeMetaDot: {
    fontSize: 10,
  },
  // Skeleton styles
  skeletonTag: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 60,
    height: 20,
    borderRadius: 12,
  },
  skeletonTitle: {
    width: "85%",
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonMeta: {
    width: "60%",
    height: 12,
    borderRadius: 4,
  },
});
