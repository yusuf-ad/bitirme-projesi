import {
  fetchMoreRecipes,
  mealPlanIngredientsService,
  MealPlanItemRecord,
} from "@/features/meal-plan";
import { useAuthContext } from "@/hooks/use-auth-context";
import { usePantryQuery } from "@/hooks/use-pantry-query";
import { supabase } from "@/lib/supabase";
import { getUserOnboardingProfile } from "@/lib/supabase-onboarding";
import { createMealItem, Meal, MealPlan, MealType } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

import { formatDate, normalizeDateParam } from "./preview-utils";

import type { MealSelectionModalHandle } from "../meal-selection-modal";

interface UseMealPlanPreviewOptions {
  mealSelectionRef: React.RefObject<MealSelectionModalHandle | null>;
}

export function useMealPlanPreview({
  mealSelectionRef,
}: UseMealPlanPreviewOptions) {
  const router = useRouter();
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

  const [mealPlan, setMealPlan] = useState<MealPlan>();
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToShoppingList, setIsAddingToShoppingList] = useState(false);
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
  // Track if we should present modal when activeMealType changes
  const shouldPresentModalRef = useRef(false);

  const planStartDate = normalizeDateParam(params.startDate);
  const planEndDate = normalizeDateParam(params.endDate ?? params.startDate);

  const allMeals = useMemo(() => {
    if (!activeMealType || !mealPlan?.[activeMealType]) return [];
    const results = mealPlan[activeMealType].results;
    return Array.isArray(results) ? results : [];
  }, [activeMealType, mealPlan]);

  const currentSelectedIndex = useMemo(() => {
    if (!activeMealType) return 0;
    const index = selectedMealIndices[activeMealType] ?? 0;
    // Ensure index is within bounds
    const maxIndex = Math.max(0, allMeals.length - 1);
    return Math.max(0, Math.min(index, maxIndex));
  }, [activeMealType, selectedMealIndices, allMeals.length]);

  // Filter out the currently selected meal to show only alternatives
  const alternativeMealsWithIndex = useMemo(() => {
    if (!Array.isArray(allMeals) || allMeals.length === 0) return [];
    return allMeals
      .map((meal, index) => ({ meal, index }))
      .filter(({ index }) => index !== currentSelectedIndex);
  }, [allMeals, currentSelectedIndex]);

  const modalMeals = useMemo(() => {
    if (!Array.isArray(alternativeMealsWithIndex)) return [];
    return alternativeMealsWithIndex.map(({ meal }) => meal).filter(Boolean);
  }, [alternativeMealsWithIndex]);

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
    (selectedMeal: Meal) => {
      if (!activeMealType || !mealPlan) return;

      const currentResults = mealPlan[activeMealType].results;
      const existingIndex = currentResults.findIndex(
        (m) => m.id === selectedMeal.id
      );

      if (existingIndex !== -1) {
        setSelectedMealIndices((prev) => ({
          ...prev,
          [activeMealType]: existingIndex,
        }));
      } else {
        const newResults = [selectedMeal, ...currentResults];

        setMealPlan((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            [activeMealType]: {
              ...prev[activeMealType],
              results: newResults,
              // Increment totalResults to account for newly added favorite
              totalResults: prev[activeMealType].totalResults + 1,
            },
          };
        });

        setSelectedMealIndices((prev) => ({
          ...prev,
          [activeMealType]: 0,
        }));
      }

      mealSelectionRef.current?.dismiss();
    },
    [activeMealType, mealPlan, mealSelectionRef]
  );

  const handleModalDismiss = useCallback(() => {
    shouldPresentModalRef.current = false;
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

  // Initialize meal plan data from params
  useEffect(() => {
    if (params.mealPlanData) {
      try {
        const data = JSON.parse(params.mealPlanData as string);

        // Check if data is valid and has at least one meal type with results
        if (data && typeof data === "object") {
          const indices: Partial<Record<MealType, number>> = {};
          const aiFlags: Partial<Record<MealType, boolean>> = {};

          // Parse initial selections if provided (e.g. returning from AI generation)
          let initialSelections: Partial<Record<MealType, number>> = {};
          if (params.initialSelections) {
            try {
              initialSelections = JSON.parse(
                params.initialSelections as string
              );
            } catch (e) {
              console.error("Error parsing initial selections:", e);
            }
          }

          // Initialize indices for meal types that have results
          if (data.breakfast?.results?.length > 0) {
            const resultsLength = data.breakfast.results.length;
            if (
              initialSelections.breakfast !== undefined &&
              initialSelections.breakfast < resultsLength
            ) {
              indices.breakfast = initialSelections.breakfast;
            } else {
              indices.breakfast = Math.floor(Math.random() * resultsLength);
            }

            if (data.breakfast.results[indices.breakfast || 0]?.isAiGenerated) {
              aiFlags.breakfast = true;
            }
          }

          if (data.lunch?.results?.length > 0) {
            const resultsLength = data.lunch.results.length;
            if (
              initialSelections.lunch !== undefined &&
              initialSelections.lunch < resultsLength
            ) {
              indices.lunch = initialSelections.lunch;
            } else {
              indices.lunch = Math.floor(Math.random() * resultsLength);
            }

            if (data.lunch.results[indices.lunch || 0]?.isAiGenerated) {
              aiFlags.lunch = true;
            }
          }

          if (data.dinner?.results?.length > 0) {
            const resultsLength = data.dinner.results.length;
            if (
              initialSelections.dinner !== undefined &&
              initialSelections.dinner < resultsLength
            ) {
              indices.dinner = initialSelections.dinner;
            } else {
              indices.dinner = Math.floor(Math.random() * resultsLength);
            }

            if (data.dinner.results[indices.dinner || 0]?.isAiGenerated) {
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
  }, [params.mealPlanData, params.initialSelections]);

  // Present modal when activeMealType changes (if triggered by handleReplaceMeal)
  useEffect(() => {
    if (activeMealType && shouldPresentModalRef.current) {
      shouldPresentModalRef.current = false;

      // Double-check that we have meals to show before presenting
      if (!Array.isArray(modalMeals) || modalMeals.length === 0) {
        console.warn("No alternative meals available for modal");
        Alert.alert(
          "No alternatives available",
          `There are no alternative recipes available for ${activeMealType}. Try generating more with AI.`
        );
        setActiveMealType(null);
        return;
      }

      // Use requestAnimationFrame to ensure modalMeals has been computed
      requestAnimationFrame(() => {
        try {
          if (
            mealSelectionRef.current &&
            Array.isArray(modalMeals) &&
            modalMeals.length > 0
          ) {
            mealSelectionRef.current.present();
          } else {
            console.error("Cannot present modal: ref or meals not available");
            setActiveMealType(null);
          }
        } catch (error) {
          console.error("Error presenting meal selection modal:", error);
          Alert.alert(
            "Error",
            "Unable to open meal selection. Please try again."
          );
          setActiveMealType(null);
        }
      });
    }
  }, [activeMealType, modalMeals, mealSelectionRef]);

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

      if (result.addedCount > 0) {
        Alert.alert(
          "Meal plan saved! 🎉",
          `${result.addedCount} missing ingredient${
            result.addedCount > 1 ? "s" : ""
          } added to your shopping list.${
            result.alreadyInPantryCount > 0
              ? `\n\n${result.alreadyInPantryCount} ingredient${
                  result.alreadyInPantryCount !== 1 ? "s" : ""
                } already in your pantry.`
              : ""
          }`,
          [
            {
              text: "View Shopping List",
              onPress: () => router.replace("/shopping-list"),
            },
            {
              text: "Go to Home",
              onPress: () =>
                router.replace({
                  pathname: "/(app)",
                  params: { date: formatDate(planStartDate) },
                }),
            },
          ]
        );
      } else {
        Alert.alert(
          "Meal plan saved! ✨",
          `All ${result.alreadyInPantryCount} ingredient${
            result.alreadyInPantryCount !== 1 ? "s" : ""
          } already in your pantry. No shopping needed!`,
          [
            {
              text: "OK",
              onPress: () =>
                router.replace({
                  pathname: "/(app)",
                  params: { date: formatDate(planStartDate) },
                }),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error adding ingredients to shopping list:", error);
      Alert.alert(
        "Meal plan saved!",
        "Your meal plan was saved, but we couldn't check your pantry for missing ingredients.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace({
                pathname: "/(app)",
                params: { date: formatDate(planStartDate) },
              }),
          },
        ]
      );
    } finally {
      setIsAddingToShoppingList(false);
    }
  };

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
          id: index,
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

  const handleGenerateWithAI = useCallback(
    (mealType: MealType) => {
      // Pass existing meal plan data so AI can add to it
      const existingMealPlanData = mealPlan
        ? JSON.stringify(mealPlan)
        : undefined;

      // Pass current selections to preserve them
      const currentSelections = JSON.stringify(selectedMealIndices);

      // Mark this meal type as AI-generated for save attribution
      setAiGeneratedTypes((prev) => ({ ...prev, [mealType]: true }));

      router.push({
        pathname: "/(plan)/ai-plan",
        params: {
          mealType,
          startDate: formatDate(planStartDate),
          endDate: formatDate(planEndDate),
          existingMealPlanData,
          currentSelections,
        },
      });
    },
    [mealPlan, selectedMealIndices, planStartDate, planEndDate, router]
  );

  const handleReplaceMeal = useCallback(
    (mealType: MealType) => {
      // If this meal type was generated via AI, go to AI generator.
      if (aiGeneratedTypes[mealType]) {
        const existingMealPlanData = mealPlan
          ? JSON.stringify(mealPlan)
          : undefined;

        const currentSelections = JSON.stringify(selectedMealIndices);

        router.push({
          pathname: "/(plan)/ai-plan",
          params: {
            mealType,
            startDate: formatDate(planStartDate),
            endDate: formatDate(planEndDate),
            existingMealPlanData,
            currentSelections,
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

      // Check if there are alternative meals (more than just the current selection)
      const currentIndex = selectedMealIndices[mealType] ?? 0;
      const allMealsForType = mealTypeData.results;
      const alternativeMeals = allMealsForType.filter(
        (_, index) => index !== currentIndex
      );

      if (alternativeMeals.length === 0) {
        Alert.alert(
          "No alternatives available",
          `There is only one recipe available for ${mealType}. Try generating more with AI.`
        );
        return;
      }

      // Ensure ref is available before setting state
      if (!mealSelectionRef.current) {
        console.error("MealSelectionModal ref is not available");
        Alert.alert(
          "Error",
          "Unable to open meal selection. Please try again."
        );
        return;
      }

      // Set flag to present modal after state update
      shouldPresentModalRef.current = true;
      setActiveMealType(mealType);
    },
    [
      aiGeneratedTypes,
      mealPlan,
      selectedMealIndices,
      planStartDate,
      planEndDate,
      router,
      mealSelectionRef,
    ]
  );

  const handleMealPress = useCallback(
    (meal: Meal, mealType: MealType) => {
      router.push({
        pathname: "/(meal)/[id]",
        params: {
          id: String(meal.id),
          mealSlot: mealType,
          isAiGenerated: String(
            !!(aiGeneratedTypes[mealType] || (meal as any)?.isAiGenerated)
          ),
        },
      });
    },
    [router, aiGeneratedTypes]
  );

  const getMealForType = useCallback(
    (mealType: MealType) => {
      const dayData = mealPlan?.[mealType];

      // Return null if no data or no results
      if (!dayData || dayData.results.length === 0) {
        return null;
      }

      const currentIndex = selectedMealIndices[mealType] ?? 0;
      const currentMeal = dayData.results[currentIndex];

      if (!currentMeal) return null;

      return {
        meal: currentMeal,
        index: currentIndex,
        isAiGenerated: !!aiGeneratedTypes[mealType],
      };
    },
    [mealPlan, selectedMealIndices, aiGeneratedTypes]
  );

  return {
    // State
    mealPlan,
    isSaving,
    isAddingToShoppingList,
    selectedMealIndices,
    activeMealType,
    aiGeneratedTypes,
    isLoadingMore,
    planStartDate,
    planEndDate,

    // Derived values
    allMeals,
    currentSelectedIndex,
    alternativeMealsWithIndex,
    modalMeals,
    hasMorePages,
    modalTitle,

    // Actions
    handleMealSelect,
    handleModalDismiss,
    handleLoadMore,
    handleSaveMealPlan,
    handleGenerateWithAI,
    handleReplaceMeal,
    handleMealPress,
    setActiveMealType,
    getMealForType,
  };
}
