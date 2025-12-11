import ReplaceIcon from "@/assets/icons/replace-icon";
import { CelebrationModal } from "@/components/CelebrationModal";
import { Colors } from "@/constants/theme";
import {
    fetchMoreRecipes,
    mealPlanIngredientsService,
    MealPlanItemRecord,
} from "@/features/meal-plan";
import type { MealSelectionModalHandle } from "@/features/meal-plan/components/meal-selection-modal";
import { MealSelectionModal } from "@/features/meal-plan/components/meal-selection-modal";
import { useAuthContext } from "@/hooks/use-auth-context";
import { usePantryQuery } from "@/hooks/use-pantry-query";
import { supabase } from "@/lib/supabase";
import { getUserOnboardingProfile } from "@/lib/supabase-onboarding";
import {
    createMealItem,
    getMealImageUrl,
    Meal,
    MealPlan,
    MealType,
} from "@/lib/utils";
import CustomButton from "@/shared/components/custom-button";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const normalizeDateParam = (value: unknown): Date => {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (typeof rawValue === "string") {
    const parsed = new Date(rawValue);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
  }

  const fallback = new Date();
  fallback.setHours(0, 0, 0, 0);
  return fallback;
};

const formatDate = (date: Date): string => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${normalized.getFullYear()}-${pad(normalized.getMonth() + 1)}-${pad(
    normalized.getDate()
  )}`;
};

export default function MealPlanPreview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { session } = useAuthContext();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  // Fetch onboarding data for pagination
  const { data: onboardingData } = useQuery({
    queryKey: ["onboardingProfile", userId],
    queryFn: () => getUserOnboardingProfile(userId!),
    enabled: !!userId,
  });

  const { data: pantryData } = usePantryQuery();

  const mealSelectionRef = useRef<MealSelectionModalHandle>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan>();
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToShoppingList, setIsAddingToShoppingList] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  // We actually don't need generic state anymore if we have specific buttons.
  // The primary button is "Shopping List", secondary is "Home".
  
  const handleShoppingListAction = () => {
    setShowSuccessModal(false);
    router.replace("/shopping-list");
  };

  const handleHomeAction = () => {
    setShowSuccessModal(false);
    router.replace("/(app)");
  };

  const [selectedMealIndices, setSelectedMealIndices] = useState<
    Partial<Record<MealType, number>>
  >({});
  const [activeMealType, setActiveMealType] = useState<MealType | null>(null);
  // Track which meal types were generated via AI in this session
  const [aiGeneratedTypes, setAiGeneratedTypes] = useState<
    Partial<Record<MealType, boolean>>
  >({});
  // Pagination state
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const planStartDate = normalizeDateParam(params.startDate);
  const planEndDate = normalizeDateParam(params.endDate ?? params.startDate);

  const allMeals = useMemo(() => {
    return activeMealType ? mealPlan?.[activeMealType]?.results ?? [] : [];
  }, [activeMealType, mealPlan]);

  const currentSelectedIndex = activeMealType
    ? selectedMealIndices[activeMealType] ?? 0
    : 0;

  // Filter out the currently selected meal to show only alternatives
  const alternativeMealsWithIndex = useMemo(() => {
    return allMeals
      .map((meal, index) => ({ meal, index }))
      .filter(({ index }) => index !== currentSelectedIndex);
  }, [allMeals, currentSelectedIndex]);

  const modalMeals = alternativeMealsWithIndex.map(({ meal }) => meal);

  // Check if there are more recipes to load for the active meal type
  const hasMorePages = useMemo(() => {
    if (!activeMealType || !mealPlan?.[activeMealType]) return false;
    const mealTypeData = mealPlan[activeMealType];
    return mealTypeData.results.length < mealTypeData.totalResults;
  }, [activeMealType, mealPlan]);

  const modalTitle = activeMealType
    ? `Replace ${activeMealType.charAt(0).toUpperCase()}${activeMealType.slice(
        1
      )}`
    : "Select a meal";

  const handleMealSelect = useCallback(
    (index: number) => {
      if (!activeMealType) return;

      // Map the index from the filtered list back to the original index
      const originalIndex = alternativeMealsWithIndex[index]?.index;

      if (originalIndex === undefined) return;

      setSelectedMealIndices((prev) => ({
        ...prev,
        [activeMealType]: originalIndex,
      }));
      mealSelectionRef.current?.dismiss();
    },
    [activeMealType, alternativeMealsWithIndex]
  );

  const handleModalDismiss = useCallback(() => {
    setActiveMealType(null);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!activeMealType || !mealPlan || isLoadingMore) return;

    const currentMealTypeData = mealPlan[activeMealType];
    if (!currentMealTypeData) return;

    const currentOffset = currentMealTypeData.results.length;

    // Check if we've already loaded all results
    if (currentOffset >= currentMealTypeData.totalResults) return;

    setIsLoadingMore(true);

    try {
      const moreRecipes = await fetchMoreRecipes(
        onboardingData,
        pantryData,
        activeMealType,
        currentOffset
      );

      if (moreRecipes && moreRecipes.results.length > 0) {
        setMealPlan((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            [activeMealType]: {
              ...prev[activeMealType],
              results: [
                ...prev[activeMealType].results,
                ...moreRecipes.results,
              ],
            },
          };
        });
      }
    } catch (error) {
      console.error("Error loading more recipes:", error);
      Alert.alert("Error", "Failed to load more recipes. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeMealType, mealPlan, isLoadingMore, onboardingData, pantryData]);

  useEffect(() => {
    if (params.mealPlanData) {
      try {
        const data = JSON.parse(params.mealPlanData as string);

        // Check if data is valid and has at least one meal type with results
        if (data && typeof data === "object") {
          const indices: Partial<Record<MealType, number>> = {};
          const aiFlags: Partial<Record<MealType, boolean>> = {};

          // Initialize indices for meal types that have results - randomly select initial meal
          if (data.breakfast?.results?.length > 0) {
            const resultsLength = data.breakfast.results.length;
            indices.breakfast = Math.floor(Math.random() * resultsLength);
            if (data.breakfast.results[0]?.isAiGenerated) {
              aiFlags.breakfast = true;
            }
          }
          if (data.lunch?.results?.length > 0) {
            const resultsLength = data.lunch.results.length;
            indices.lunch = Math.floor(Math.random() * resultsLength);
            if (data.lunch.results[0]?.isAiGenerated) {
              aiFlags.lunch = true;
            }
          }
          if (data.dinner?.results?.length > 0) {
            const resultsLength = data.dinner.results.length;
            indices.dinner = Math.floor(Math.random() * resultsLength);
            if (data.dinner.results[0]?.isAiGenerated) {
              aiFlags.dinner = true;
            }
          }

          setMealPlan(data);
          setSelectedMealIndices(indices);
          setAiGeneratedTypes(aiFlags);
        } else {
          console.error("Invalid meal plan structure:", data);
        }
      } catch (error) {
        console.error("Error parsing meal plan data:", error);
      }
    }
  }, [params.mealPlanData]);

  const handleSaveMealPlan = async () => {
    if (!session?.user?.id) {
      Alert.alert("You need to sign in", "Please sign in to save a meal plan.");
      return;
    }

    if (!mealPlan) {
      Alert.alert(
        "Nothing to save",
        "Generate a meal plan before trying to save it."
      );
      return;
    }

    // Only create meal items for meal types that exist in the plan
    type MealItemPayload = {
      spoonacular_recipe_id: number;
      recipe_name: string;
      recipe_image_url?: string | null;
      calories_per_serving?: number | null;
      carbs_per_serving?: number | null;
      protein_per_serving?: number | null;
      fat_per_serving?: number | null;
      ready_in_minutes?: number | null;
      meal_date: string;
      meal_type: MealType;
      is_ai_generated?: boolean;
    };
    const mealItems: MealItemPayload[] = [];

    if (
      mealPlan.breakfast?.results?.length > 0 &&
      selectedMealIndices.breakfast !== undefined
    ) {
      const breakfastMealItem = createMealItem(
        mealPlan,
        "breakfast",
        selectedMealIndices.breakfast,
        planStartDate
      );
      if (breakfastMealItem) {
        mealItems.push({
          ...breakfastMealItem,
          is_ai_generated: !!aiGeneratedTypes.breakfast,
        });
      }
    }

    if (
      mealPlan.lunch?.results?.length > 0 &&
      selectedMealIndices.lunch !== undefined
    ) {
      const lunchMealItem = createMealItem(
        mealPlan,
        "lunch",
        selectedMealIndices.lunch,
        planStartDate
      );
      if (lunchMealItem) {
        mealItems.push({
          ...lunchMealItem,
          is_ai_generated: !!aiGeneratedTypes.lunch,
        });
      }
    }

    if (
      mealPlan.dinner?.results?.length > 0 &&
      selectedMealIndices.dinner !== undefined
    ) {
      const dinnerMealItem = createMealItem(
        mealPlan,
        "dinner",
        selectedMealIndices.dinner,
        planStartDate
      );
      if (dinnerMealItem) {
        mealItems.push({
          ...dinnerMealItem,
          is_ai_generated: !!aiGeneratedTypes.dinner,
        });
      }
    }

    if (mealItems.length === 0) {
      Alert.alert(
        "Missing recipes",
        "Select a recipe for at least one meal before saving."
      );
      return;
    }

    setIsSaving(true);

    try {
      const startDateString = formatDate(planStartDate);
      const endDateString = formatDate(planEndDate);

      const { data: existingPlans, error: existingPlansError } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", session.user.id)
        .lte("start_date", endDateString)
        .gte("end_date", startDateString)
        .limit(1);

      if (existingPlansError) {
        throw existingPlansError;
      }

      if (existingPlans && existingPlans.length > 0) {
        const existingPlanId = existingPlans[0].id;

        // Check if this plan has items
        const { data: existingItems, error: itemsCheckError } = await supabase
          .from("meal_plan_items")
          .select("id")
          .eq("meal_plan_id", existingPlanId)
          .limit(1);

        if (itemsCheckError) {
          throw itemsCheckError;
        }

        if (existingItems && existingItems.length > 0) {
          // Plan has items - show error
          Alert.alert(
            "Meal plan already exists",
            "You already have a meal plan with recipes for this date range."
          );
          return;
        }

        // Plan exists but has no items - delete it and create new one
        console.log("Deleting orphaned meal plan:", existingPlanId);
        const { error: deleteError } = await supabase
          .from("meal_plans")
          .delete()
          .eq("id", existingPlanId);

        if (deleteError) {
          throw deleteError;
        }
      }

      const { data: newPlan, error: planError } = await supabase
        .from("meal_plans")
        .insert([
          {
            user_id: session.user.id,
            name: `my meal plan ${startDateString}`,
            start_date: startDateString,
            end_date: endDateString,
          },
        ])
        .select()
        .single();

      if (planError) {
        throw planError;
      }

      if (!newPlan) {
        throw new Error("Meal plan could not be created.");
      }

      const itemsPayload = mealItems.map((item) => ({
        ...item,
        meal_plan_id: newPlan.id,
      }));

      const { error: itemsError } = await supabase
        .from("meal_plan_items")
        .insert(itemsPayload);

      if (itemsError) {
        // Rollback: Delete the meal plan if items couldn't be inserted
        console.error("Error inserting meal items:", itemsError);
        await supabase.from("meal_plans").delete().eq("id", newPlan.id);
        throw new Error(
          `Failed to save meal items: ${itemsError.message || "Unknown error"}`
        );
      }

      // Invalidate meal plans cache to refresh the home page
      await queryClient.invalidateQueries({
        queryKey: ["meal-plans"],
      });

      // Convert mealItems to MealPlanItemRecord format for the ingredients service
      const savedMealPlanItems: MealPlanItemRecord[] = itemsPayload.map(
        (item, index) => ({
          id: index, // Temporary ID, not needed for fetching recipes
          meal_plan_id: newPlan.id,
          spoonacular_recipe_id: item.spoonacular_recipe_id,
          recipe_name: item.recipe_name,
          recipe_image_url: item.recipe_image_url ?? null,
          calories_per_serving: item.calories_per_serving ?? null,
          carbs_per_serving: item.carbs_per_serving ?? null,
          protein_per_serving: item.protein_per_serving ?? null,
          fat_per_serving: item.fat_per_serving ?? null,
          ready_in_minutes: item.ready_in_minutes ?? null,
          meal_date: item.meal_date,
          meal_type: item.meal_type,
          is_ai_generated: !!item.is_ai_generated,
        })
      );

      // Automatically add missing ingredients to shopping list
      await handleAddMissingIngredients(savedMealPlanItems);
    } catch (error) {
      console.error("Error saving meal plan:", error);
      const message =
        error instanceof Error ? error.message : "Unable to save meal plan.";
      Alert.alert("Error saving meal plan", message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMissingIngredients = async (
    mealPlanItems: MealPlanItemRecord[]
  ) => {
    setIsAddingToShoppingList(true);

    try {
      const result =
        await mealPlanIngredientsService.addMissingIngredientsToShoppingList(
          mealPlanItems
        );

      // Invalidate pantry query to refresh shopping list
      await queryClient.invalidateQueries({
        queryKey: ["pantry"],
      });

      // Whether ingredients were added or not, we show the success modal
      // User can choose to go to Shopping List or Home
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error adding ingredients to shopping list:", error);
      // Still show success for meal plan save
      setShowSuccessModal(true);
    } finally {
      setIsAddingToShoppingList(false);
    }
  };

  const renderMealItem = (meal: Meal, mealType: MealType) => {
    const imageUrl = getMealImageUrl(meal);

    const handleReplace = () => {
      // If this meal type was generated via AI, go to AI generator.
      if (aiGeneratedTypes[mealType]) {
        const existingMealPlanData = mealPlan
          ? JSON.stringify(mealPlan)
          : undefined;

        router.push({
          pathname: "/(plan)/ai-plan",
          params: {
            mealType,
            startDate: formatDate(planStartDate),
            endDate: formatDate(planEndDate),
            existingMealPlanData,
          },
        });
        return;
      }

      // Otherwise, open local selection modal for non-AI meals
      const mealTypeData = mealPlan?.[mealType];
      if (!mealTypeData || mealTypeData.results.length === 0) {
        Alert.alert(
          "No recipes found",
          `There are no ${mealType} recipes to choose from right now.`
        );
        return;
      }
      setActiveMealType(mealType);
      mealSelectionRef.current?.present();
    };

    const carbs = meal.nutrition?.carbs
      ? `${Math.round(meal.nutrition.carbs)}g`
      : undefined;
    const protein = meal.nutrition?.protein
      ? `${Math.round(meal.nutrition.protein)}g`
      : undefined;
    const fat = meal.nutrition?.fat
      ? `${Math.round(meal.nutrition.fat)}g`
      : undefined;

    return (
      <View key={meal.id} style={styles.mealItem}>
        <Pressable
          style={styles.mealContent}
          onPress={() =>
            router.push({
              pathname: "/(meal)/[id]",
              params: {
                id: String(meal.id),
                mealSlot: mealType,
                isAiGenerated: String(
                  !!(aiGeneratedTypes[mealType] || (meal as any)?.isAiGenerated)
                ),
              },
            })
          }
        >
          {imageUrl ? (
            <ExpoImage
              source={{ uri: imageUrl }}
              style={styles.mealImage}
              contentFit="cover"
              transition={100}
              cachePolicy="disk"
            />
          ) : (
            <View style={[styles.mealImage, styles.placeholderImage]} />
          )}
          <View style={styles.mealInfo}>
            <Text style={styles.mealTitle}>{meal.title}</Text>
            <View style={styles.mealDetails}>
              {meal.nutrition?.calories && (
                <Text style={styles.mealDetailText}>
                  {Math.round(meal.nutrition.calories)} cal
                </Text>
              )}
              <Text>|</Text>
              {meal.readyInMinutes && (
                <Text style={styles.mealDetailText}>
                  {meal.readyInMinutes} min
                </Text>
              )}
            </View>
            {/* Macronutrients */}
            {(carbs || protein || fat) && (
              <View style={styles.macrosContainer}>
                {carbs && (
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Carbs</Text>
                    <Text style={styles.macroValue}>{carbs}</Text>
                  </View>
                )}
                {protein && (
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Protein</Text>
                    <Text style={styles.macroValue}>{protein}</Text>
                  </View>
                )}
                {fat && (
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Fat</Text>
                    <Text style={styles.macroValue}>{fat}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </Pressable>
        <CustomButton
          containerStyle={styles.replaceButton}
          onPress={handleReplace}
        >
          <ReplaceIcon />
        </CustomButton>
      </View>
    );
  };

  const handleGenerateWithAI = (mealType: MealType) => {
    // Pass existing meal plan data so AI can add to it
    const existingMealPlanData = mealPlan
      ? JSON.stringify(mealPlan)
      : undefined;

    // Mark this meal type as AI-generated for save attribution
    setAiGeneratedTypes((prev) => ({ ...prev, [mealType]: true }));

    router.push({
      pathname: "/(plan)/ai-plan",
      params: {
        mealType,
        startDate: formatDate(planStartDate),
        endDate: formatDate(planEndDate),
        existingMealPlanData,
      },
    });
  };

  const renderEmptyMealState = (mealType: MealType) => {
    const mealTypeLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

    return (
      <View key={mealType}>
        <Text style={styles.mealTypeHeader}>{mealTypeLabel}</Text>
        <View style={styles.skeletonMealItem}>
          {/* Skeleton Image */}
          <View style={styles.skeletonImage}>
            <MaterialIcons name="image" size={28} color={Colors.gray[400]} />
          </View>
          {/* Skeleton Content */}
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonTitleLine} />
            <View style={styles.skeletonDetailLine} />
            {/* AI Generate Button */}
            <Pressable
              style={styles.aiGenerateButton}
              onPress={() => handleGenerateWithAI(mealType)}
            >
              <MaterialIcons name="auto-awesome" size={16} color="#fff" />
              <Text style={styles.aiGenerateButtonText}>Generate with AI</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderDayMeals = (mealType: MealType) => {
    const dayData = mealPlan?.[mealType];

    // Show empty state with "Generate with AI" button if no data or no results
    if (!dayData || dayData.results.length === 0) {
      return renderEmptyMealState(mealType);
    }

    const currentIndex = selectedMealIndices[mealType] ?? 0;
    const currentMeal = dayData.results[currentIndex];

    if (!currentMeal) return null;

    return (
      <View key={mealType}>
        <Text style={styles.mealTypeHeader}>
          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </Text>
        {renderMealItem(currentMeal, mealType)}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Meal plan preview</Text>
        <Pressable onPress={() => router.dismissTo("/")}>
          <Text style={styles.closeButton}>Close</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.description}>
          Here are the recipes we&apos;ve chosen for your meal plan. Feel free
          to swap out any that you don&apos;t like!
        </Text>

        {/* Meal Types */}
        {renderDayMeals("breakfast")}
        {renderDayMeals("lunch")}
        {renderDayMeals("dinner")}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <CustomButton
          containerStyle={styles.saveButton}
          onPress={handleSaveMealPlan}
          disabled={isSaving || isAddingToShoppingList}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save Meal Plan"}
          </Text>
        </CustomButton>
      </View>

      {/* Loading Overlay for Shopping List */}
      {isAddingToShoppingList && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.lilac[600]} />
            <Text style={styles.loadingText}>
              Checking pantry and adding{"\n"}missing ingredients...
            </Text>
          </View>
        </View>
      )}

      <MealSelectionModal
        ref={mealSelectionRef}
        meals={modalMeals}
        selectedIndex={-1}
        title={modalTitle}
        onSelect={handleMealSelect}
        onDismiss={handleModalDismiss}
        onGenerateMore={
          activeMealType
            ? () => {
                mealSelectionRef.current?.dismiss();
                handleGenerateWithAI(activeMealType);
              }
            : undefined
        }
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
        hasMorePages={hasMorePages}
      />

      <CelebrationModal
        visible={showSuccessModal}
        type="meal-plan-saved"
        onClose={() => setShowSuccessModal(false)}
        onAction={handleShoppingListAction}
        onSecondaryAction={handleHomeAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  closeButton: {
    fontSize: 16,
    color: Colors.lilac[600],
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    marginVertical: 12,
  },
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  mealContent: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
  },
  mealImage: {
    width: 73,
    height: 73,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
  },
  placeholderImage: {
    backgroundColor: Colors.gray[300],
  },
  mealInfo: {
    flex: 1,
    gap: 6,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: Colors.text.primary,
  },
  mealDetails: {
    flexDirection: "row",
    gap: 12,
  },
  mealDetailText: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
    color: Colors.text.secondary,
  },
  mealBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 1,
    borderRadius: 16,
    borderWidth: 1,
  },
  mealBadgeText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#000000",
  },
  mealTypeHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#141217",
    marginTop: 20,
  },
  skeletonMealItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  skeletonImage: {
    width: 73,
    height: 73,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderStyle: "dashed",
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonTitleLine: {
    height: 16,
    width: "70%",
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
  },
  skeletonDetailLine: {
    height: 12,
    width: "40%",
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
  },
  aiGenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: Colors.lilac[900],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  aiGenerateButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  replaceButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lilac[900],
    borderRadius: 8,
  },
  macrosContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.background.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 16,
    color: Colors.gray[500],
  },
  macroValue: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
    color: Colors.lilac[900],
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveButton: {
    backgroundColor: Colors.lilac[900],
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    color: "#fff",
    textAlign: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 16,
    marginHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
