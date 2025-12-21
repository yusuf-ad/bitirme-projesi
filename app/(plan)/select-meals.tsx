import { CelebrationModal } from "@/components/CelebrationModal";
import { Colors, getThemeColors } from "@/constants/theme";
import { fetchRecipes } from "@/features/meal-plan";
import type { MealType } from "@/features/meal-plan/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { usePantryQuery } from "@/hooks/use-pantry-query";
import { getUserOnboardingProfile } from "@/lib/supabase-onboarding";
import { useTheme } from "@/providers/theme-provider";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 40;

interface MealStep {
  id: MealType;
  label: string;
  icon: string;
  description: string;
  calories: string;
  bgColor: string;
  bgColorDark: string;
}

const MEAL_STEPS: MealStep[] = [
  {
    id: "breakfast",
    label: "Breakfast",
    icon: "🥐",
    description: "Kickstart your day with energy.",
    calories: "400-500 kcal",
    bgColor: "#FFF5E6",
    bgColorDark: "rgba(255, 180, 100, 0.15)",
  },
  {
    id: "lunch",
    label: "Lunch",
    icon: "🍝",
    description: "Fuel your afternoon productivity.",
    calories: "500-700 kcal",
    bgColor: "#E8F5E9",
    bgColorDark: "rgba(100, 200, 120, 0.15)",
  },
  {
    id: "dinner",
    label: "Dinner",
    icon: "🍽️",
    description: "End your day satisfied.",
    calories: "500-600 kcal",
    bgColor: "#E3F2FD",
    bgColorDark: "rgba(100, 150, 255, 0.15)",
  },
];

export default function SelectMeals() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { session } = useAuthContext();
  const userId = session?.user?.id;
  const flatListRef = useRef<FlatList>(null);
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[800];

  const { data: onboardingData } = useQuery({
    queryKey: ["onboardingProfile", userId],
    queryFn: () => getUserOnboardingProfile(userId!),
    enabled: !!userId,
  });

  const { data: pantryData } = usePantryQuery();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMealTypes, setSelectedMealTypes] = useState<
    Record<MealType, boolean>
  >({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingNavigationParams, setPendingNavigationParams] =
    useState<any>(null);

  const selectedDate = new Date(params.startDate as string);
  const isToday = (() => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  })();

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const selectedCount = Object.values(selectedMealTypes).filter(Boolean).length;

  const handleModalAction = () => {
    setShowSuccessModal(false);
    if (pendingNavigationParams) {
      router.push(pendingNavigationParams);
    }
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentStep(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const scrollToIndex = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const handleAddMeal = useCallback(
    (mealId: MealType) => {
      setSelectedMealTypes((prev) => ({
        ...prev,
        [mealId]: true,
      }));
      const currentIndex = MEAL_STEPS.findIndex((s) => s.id === mealId);
      if (currentIndex < MEAL_STEPS.length - 1) {
        setTimeout(() => scrollToIndex(currentIndex + 1), 250);
      }
    },
    [scrollToIndex]
  );

  const handleRemoveMeal = useCallback((mealId: MealType) => {
    setSelectedMealTypes((prev) => ({
      ...prev,
      [mealId]: false,
    }));
  }, []);

  async function handleCreateMealPlan() {
    if (isLoading || selectedCount === 0) return;
    setIsLoading(true);
    try {
      const results = await fetchRecipes(
        onboardingData,
        pantryData,
        selectedMealTypes
      );

      const mealPlanData: Record<
        string,
        { results: any[]; totalResults: number }
      > = {};

      // Initialize plan data for ONLY selected meal types
      (Object.keys(selectedMealTypes) as MealType[]).forEach((type) => {
        if (selectedMealTypes[type]) {
          // Find if we have fetched results for this type
          const resultForType = results?.find((r) => r.mealType === type);

          mealPlanData[type] = {
            results: resultForType?.results || [],
            totalResults:
              resultForType?.results[0]?.totalResults ||
              resultForType?.results?.length ||
              0,
          };
        }
      });

      setPendingNavigationParams({
        pathname: "/preview",
        params: {
          startDate: params.startDate as string,
          endDate: (params.endDate as string) || (params.startDate as string),
          mealPlanData: JSON.stringify(mealPlanData),
        },
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating meal plan:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const renderMealCard = useCallback(
    ({ item, index }: { item: MealStep; index: number }) => {
      const isSelected = selectedMealTypes[item.id];
      const isLast = index === MEAL_STEPS.length - 1;

      return (
        <View style={styles.cardWrapper}>
          <View
            style={[
              styles.mealCard, 
              { 
                backgroundColor: themeColors.background.surface,
                borderColor: isSelected ? Colors.green[500] : (isDark ? themeColors.border.light : Colors.gray[200]),
              }
            ]}
          >
            <View
              style={[
                styles.mealIconWrapper,
                { backgroundColor: isDark ? item.bgColorDark : item.bgColor },
              ]}
            >
              <Text style={styles.mealEmoji}>{item.icon}</Text>
            </View>
            <Text style={[styles.mealTitle, { color: themeColors.text.primary }]}>{item.label}</Text>
            <Text style={[styles.mealDescription, { color: themeColors.text.secondary }]}>{item.description}</Text>
            {isSelected ? (
              <Pressable
                onPress={() => handleRemoveMeal(item.id)}
                style={styles.addedButton}
              >
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.addedButtonText}>Added to Plan</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => handleAddMeal(item.id)}
                style={[styles.addButton, { backgroundColor: isDark ? "rgba(34, 197, 94, 0.15)" : Colors.green[100], borderColor: Colors.green[400] }]}
              >
                <Ionicons name="add" size={16} color={Colors.green[600]} />
                <Text style={[styles.addButtonText, { color: Colors.green[600] }]}>Add {item.label}</Text>
              </Pressable>
            )}
            <Text style={[styles.caloriesText, { color: themeColors.text.tertiary }]}>
              Recommended: {item.calories}
            </Text>
            <View style={styles.skipContainer}>
              {!isLast ? (
                <Pressable
                  onPress={() => scrollToIndex(index + 1)}
                  style={styles.skipButton}
                >
                  <Text style={[styles.skipText, { color: themeColors.text.tertiary }]}>Skip</Text>
                </Pressable>
              ) : (
                <View style={styles.skipPlaceholder} />
              )}
            </View>
          </View>
        </View>
      );
    },
    [selectedMealTypes, handleAddMeal, handleRemoveMeal, scrollToIndex, isDark, themeColors]
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: themeColors.background.primary,
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <Animated.View entering={FadeIn.duration(300)} style={[styles.header, { backgroundColor: themeColors.background.primary, borderColor: isDark ? themeColors.border.light : Colors.lilac[100] }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.headerButton, { backgroundColor: isDark ? themeColors.background.surface : Colors.gray[100] }]}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={22} color={themeColors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>Create Meal Plan</Text>
        <Pressable
          onPress={() => router.dismissTo("/")}
          style={[styles.headerButton, { backgroundColor: isDark ? themeColors.background.surface : Colors.gray[100] }]}
          hitSlop={12}
        >
          <Ionicons name="close" size={22} color={themeColors.text.tertiary} />
        </Pressable>
      </Animated.View>

      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.titleSection}
        >
          <Text style={[styles.mainTitle, { color: themeColors.text.primary }]}>Build your perfect day!</Text>
          <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
            Swipe to browse meals, tap to add.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(150)}
          style={[styles.dateCard, { backgroundColor: themeColors.background.surface }]}
        >
          <View style={[styles.dateIconWrapper, { backgroundColor: isDark ? "rgba(34, 197, 94, 0.15)" : Colors.green[100] }]}>
            <Ionicons name="calendar" size={16} color={Colors.green[500]} />
          </View>
          <Text style={[styles.dateLabel, { color: themeColors.text.tertiary }]}>{isToday ? "Today" : "Selected"}</Text>
          <Text style={[styles.dateText, { color: themeColors.text.primary }]}>{formattedDate}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(200)}
          style={styles.progressDots}
        >
          {MEAL_STEPS.map((step, index) => (
            <Pressable key={step.id} onPress={() => scrollToIndex(index)}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isDark ? themeColors.border.light : Colors.gray[200] },
                  index === currentStep && [styles.dotActive, { backgroundColor: Colors.green[500] }],
                  selectedMealTypes[step.id] && [styles.dotCompleted, { backgroundColor: Colors.green[400] }],
                ]}
              />
            </Pressable>
          ))}
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(250)}
          style={styles.carouselContainer}
        >
          <FlatList
            ref={flatListRef}
            data={MEAL_STEPS}
            renderItem={renderMealCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            contentContainerStyle={styles.carouselContent}
            getItemLayout={(_, index) => ({
              length: CARD_WIDTH,
              offset: CARD_WIDTH * index,
              index,
            })}
          />
        </Animated.View>
      </View>

      {/* footer */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(300)}
        style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: themeColors.background.primary, borderTopColor: themeColors.border.light }]}
      >
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryText, { color: themeColors.text.secondary }]}>{selectedCount}/3 meals</Text>
          <View style={styles.summaryDots}>
            {MEAL_STEPS.map((step) => (
              <View
                key={step.id}
                style={[
                  styles.summaryDot,
                  { backgroundColor: isDark ? themeColors.border.light : Colors.gray[200] },
                  selectedMealTypes[step.id] && [styles.summaryDotActive, { backgroundColor: Colors.green[500] }],
                ]}
              />
            ))}
          </View>
        </View>
        <CustomButton
          containerStyle={[
            styles.createButton,
            { backgroundColor: accentColor },
            (isLoading || selectedCount === 0) && styles.createButtonDisabled,
          ]}
          onPress={handleCreateMealPlan}
          disabled={isLoading || selectedCount === 0}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.createButtonText}>
                {selectedCount === 0 ? "Select meals" : "Create Plan"}
              </Text>
              {selectedCount > 0 && (
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              )}
            </>
          )}
        </CustomButton>
      </Animated.View>

      <CelebrationModal
        visible={showSuccessModal}
        type="meal-plan-created"
        onClose={() => setShowSuccessModal(false)}
        onAction={handleModalAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background.primary,
    borderColor: Colors.lilac[100],
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.green[100],
    justifyContent: "center",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.tertiary,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "right",
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 28,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.gray[200],
  },
  dotActive: {
    backgroundColor: Colors.green[500],
    width: 36,
  },
  dotCompleted: {
    backgroundColor: Colors.green[400],
  },
  carouselContainer: {
    flex: 1,
    marginHorizontal: -20,
    justifyContent: "center",
  },
  carouselContent: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  cardWrapper: {
    width: CARD_WIDTH,
    justifyContent: "center",
  },
  mealCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.gray[200],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  mealCardSelected: {
    borderColor: Colors.green[500],
  },
  mealIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  mealEmoji: {
    fontSize: 32,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.green[100],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.green[400],
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.green[700],
  },
  addedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.green[600],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    marginBottom: 10,
  },
  addedButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  caloriesText: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  skipContainer: {
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  skipButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  skipPlaceholder: {
    height: 20,
  },
  skipText: {
    fontSize: 13,
    color: Colors.text.tertiary,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: "600",
  },
  summaryDots: {
    flexDirection: "row",
    gap: 5,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[200],
  },
  summaryDotActive: {
    backgroundColor: Colors.green[500],
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: Colors.lilac[800],
    borderRadius: 14,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.2,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
});
