import { Colors } from "@/constants/theme";
import {
  AIMealTypeOption,
  AIRecipeGenerating,
  AIRecipePreview,
  CALORIE_RANGE_OPTIONS,
  CalorieRangeOption,
  ChipSection,
  COOKING_TIME_OPTIONS,
  CookingTimeOption,
  IngredientSelectionModal,
  IngredientSelectionModalHandle,
  MEAL_TYPE_OPTIONS,
  SelectedIngredient,
  UserPreferencesSection,
} from "@/features/meal-plan";
import { useAuthContext } from "@/hooks/use-auth-context";
import {
  resolveAllergiesFast,
  resolveDietPreferences,
} from "@/lib/allergies-diet-helpers";
import { Recipe } from "@/lib/spoonacular";
import { supabase } from "@/lib/supabase";
import { getUserOnboardingProfile } from "@/lib/supabase-onboarding";
import CustomButton from "@/shared/components/custom-button";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ViewState = "form" | "generating" | "preview";

interface AIGeneratedRecipe extends Recipe {
  isAiGenerated?: boolean;
}

const INGREDIENT_IMAGE_BASE_URL =
  "https://spoonacular.com/cdn/ingredients_100x100";

// Selected Ingredient Chip Component
function SelectedIngredientChip({
  ingredient,
  onRemove,
}: {
  ingredient: SelectedIngredient;
  onRemove: () => void;
}) {
  const imageUrl = ingredient.image
    ? `${INGREDIENT_IMAGE_BASE_URL}/${ingredient.image}`
    : undefined;

  return (
    <View style={styles.selectedIngredientChip}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.selectedIngredientImage}
          resizeMode="contain"
        />
      )}
      <Text style={styles.selectedIngredientName} numberOfLines={1}>
        {ingredient.name}
      </Text>
      <Pressable onPress={onRemove} hitSlop={8}>
        <MaterialIcons name="close" size={16} color={Colors.gray[500]} />
      </Pressable>
    </View>
  );
}

export default function AiRecipe() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    mealSlot?: string;
    selectedDate?: string;
    mealType?: string;
  }>();
  const { session } = useAuthContext();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  // Check if meal type is locked (coming from EmptyMealSlot)
  const isFromMealSlot = !!params.mealSlot && !!params.selectedDate;
  const lockedMealType = params.mealSlot as AIMealTypeOption | undefined;

  // Modal ref
  const ingredientModalRef = useRef<IngredientSelectionModalHandle>(null);

  // Fetch onboarding data from Supabase
  const { data: onboardingData } = useQuery({
    queryKey: ["onboardingProfile", userId],
    queryFn: () => getUserOnboardingProfile(userId!),
    enabled: !!userId,
  });

  // Extract preferences from onboarding data
  const selectedAllergies = useMemo(
    () => onboardingData?.tastePreferences?.allergies_dislikes || [],
    [onboardingData?.tastePreferences?.allergies_dislikes]
  );
  const selectedDietPreferences = useMemo(
    () => onboardingData?.tastePreferences?.diet_preferences || [],
    [onboardingData?.tastePreferences?.diet_preferences]
  );
  const selectedCuisines = useMemo(
    () => onboardingData?.tastePreferences?.cuisines || [],
    [onboardingData?.tastePreferences?.cuisines]
  );
  const dislikedCuisines = useMemo(
    () => onboardingData?.tastePreferences?.cuisine_dislikes || [],
    [onboardingData?.tastePreferences?.cuisine_dislikes]
  );

  // Resolve allergies and diet preferences with images
  const resolvedAllergies = useMemo(
    () => resolveAllergiesFast(selectedAllergies),
    [selectedAllergies]
  );
  const resolvedDietPreferences = useMemo(
    () => resolveDietPreferences(selectedDietPreferences),
    [selectedDietPreferences]
  );

  // Local state
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredient[]
  >([]);
  const [selectedMealType, setSelectedMealType] = useState<AIMealTypeOption>(
    lockedMealType || "breakfast"
  );
  const [selectedCookingTime, setSelectedCookingTime] =
    useState<CookingTimeOption>("<15");
  const [selectedCalorieRange, setSelectedCalorieRange] =
    useState<CalorieRangeOption>("<200");

  // View state management
  const [viewState, setViewState] = useState<ViewState>("form");
  const [generatedRecipe, setGeneratedRecipe] =
    useState<AIGeneratedRecipe | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Set initial meal type from params
  useEffect(() => {
    if (params.mealType) {
      const mealType = params.mealType as string;
      if (["breakfast", "lunch", "dinner"].includes(mealType)) {
        setSelectedMealType(mealType as AIMealTypeOption);
      }
    }
  }, [params.mealType]);

  const handleOpenIngredientModal = () => {
    ingredientModalRef.current?.present();
  };

  const handleApplyIngredients = (ingredients: SelectedIngredient[]) => {
    setSelectedIngredients(ingredients);
  };

  const handleRemoveIngredient = (id: string) => {
    setSelectedIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const handleGenerateRecipe = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const ingredientNames = selectedIngredients.map((ing) => ing.name);

    // Convert allergy IDs to names using resolved allergies
    const allergyNames = resolvedAllergies.map((allergy) => allergy.name);

    setViewState("generating");
    setIsRegenerating(false);

    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients: ingredientNames,
          mealType: selectedMealType,
          cookingTime: selectedCookingTime,
          calorieRange: selectedCalorieRange,
          allergies: allergyNames,
          dietPreferences: selectedDietPreferences,
          cuisines: selectedCuisines,
          dislikedCuisines,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recipe");
      }

      const recipe: AIGeneratedRecipe = await response.json();
      setGeneratedRecipe(recipe);
      setViewState("preview");
    } catch (error) {
      console.error("Error generating recipe:", error);
      Alert.alert(
        "Generation Failed",
        "We couldn't create a recipe. Please try again.",
        [
          {
            text: "Cancel",
            onPress: () => setViewState("form"),
            style: "cancel",
          },
          { text: "Retry", onPress: handleGenerateRecipe },
        ]
      );
    }
  }, [
    selectedIngredients,
    selectedMealType,
    selectedCookingTime,
    selectedCalorieRange,
    resolvedAllergies,
    selectedDietPreferences,
    selectedCuisines,
    dislikedCuisines,
  ]);

  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    await handleGenerateRecipe();
  }, [handleGenerateRecipe]);

  // Save recipe directly to database
  const handleSaveRecipe = useCallback(async () => {
    if (!generatedRecipe || !userId) return;

    setIsSaving(true);

    try {
      // Get date from params or use today
      const dateString =
        params.selectedDate || new Date().toISOString().split("T")[0];
      const mealType = selectedMealType;

      // Get or create meal plan for the date
      const { data: plans } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", userId)
        .lte("start_date", dateString)
        .gte("end_date", dateString)
        .limit(1);

      let mealPlanId = plans?.[0]?.id;

      // Create meal plan if doesn't exist
      if (!mealPlanId) {
        const { data: newPlan, error: planError } = await supabase
          .from("meal_plans")
          .insert({
            user_id: userId,
            name: `Meal Plan - ${dateString}`,
            start_date: dateString,
            end_date: dateString,
          })
          .select()
          .single();

        if (planError) throw planError;
        mealPlanId = newPlan.id;
      }

      // Extract nutrition values
      const nutrients = generatedRecipe.nutrition?.nutrients || [];
      const caloriesRaw = nutrients.find(
        (n) => n.name.toLowerCase() === "calories"
      )?.amount;
      const carbsRaw = nutrients.find(
        (n) => n.name.toLowerCase() === "carbohydrates"
      )?.amount;
      const proteinRaw = nutrients.find(
        (n) => n.name.toLowerCase() === "protein"
      )?.amount;
      const fatRaw = nutrients.find(
        (n) => n.name.toLowerCase() === "fat"
      )?.amount;

      const calories =
        typeof caloriesRaw === "number" ? Math.round(caloriesRaw) : null;
      const carbs = typeof carbsRaw === "number" ? Math.round(carbsRaw) : null;
      const protein =
        typeof proteinRaw === "number" ? Math.round(proteinRaw) : null;
      const fat = typeof fatRaw === "number" ? Math.round(fatRaw) : null;

      // Save meal item with validation
      if (!mealPlanId) {
        throw new Error("Failed to create or retrieve meal plan");
      }

      const { error: itemError } = await supabase
        .from("meal_plan_items")
        .insert({
          meal_plan_id: mealPlanId,
          spoonacular_recipe_id: generatedRecipe.id,
          recipe_name: generatedRecipe.title || "Untitled Recipe",
          recipe_image_url: generatedRecipe.image ?? "",
          calories_per_serving: calories,
          carbs_per_serving: carbs,
          protein_per_serving: protein,
          fat_per_serving: fat,
          ready_in_minutes: generatedRecipe.readyInMinutes ?? null,
          meal_date: dateString,
          meal_type: mealType,
        });

      if (itemError) throw itemError;

      // Invalidate queries to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["meal-plans"] });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert("Success!", "Recipe added to your meal plan.", [
        {
          text: "OK",
          onPress: () => {
            // Navigate back to home with the selected date
            router.replace({
              pathname: "/(app)",
              params: { date: dateString },
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Could not save the recipe. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [
    generatedRecipe,
    userId,
    params.selectedDate,
    selectedMealType,
    queryClient,
    router,
  ]);

  const handleBackFromPreview = useCallback(() => {
    setViewState("form");
    setGeneratedRecipe(null);
  }, []);

  // Handle meal type selection - only allow if not locked
  const handleMealTypeSelect = useCallback(
    (mealType: AIMealTypeOption) => {
      if (!isFromMealSlot) {
        setSelectedMealType(mealType);
      }
    },
    [isFromMealSlot]
  );

  // Render generating state
  if (viewState === "generating") {
    return <AIRecipeGenerating />;
  }

  // Render preview state
  if (viewState === "preview" && generatedRecipe) {
    return (
      <AIRecipePreview
        recipe={generatedRecipe}
        onConfirm={handleSaveRecipe}
        onRegenerate={handleRegenerate}
        onBack={handleBackFromPreview}
        mealSlot={params.mealSlot}
        isRegenerating={isRegenerating || isSaving}
      />
    );
  }

  // Filter meal type options when locked
  const mealTypeOptions = isFromMealSlot
    ? MEAL_TYPE_OPTIONS.filter((opt) => opt.id === lockedMealType)
    : MEAL_TYPE_OPTIONS;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>AI Recipe Generator</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Key Ingredients Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Key Ingredients <Text style={styles.required}>*</Text>
            </Text>
            {selectedIngredients.length > 0 && (
              <Text style={styles.selectedCount}>
                {selectedIngredients.length} selected
              </Text>
            )}
          </View>

          {/* Selected Ingredients Preview */}
          {selectedIngredients.length > 0 ? (
            <View style={styles.selectedIngredientsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedIngredientsScroll}
              >
                {selectedIngredients.map((ingredient) => (
                  <SelectedIngredientChip
                    key={ingredient.id}
                    ingredient={ingredient}
                    onRemove={() => handleRemoveIngredient(ingredient.id)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Add Ingredients Button */}
          <Pressable
            style={styles.addIngredientsButton}
            onPress={handleOpenIngredientModal}
          >
            <MaterialIcons name="add" size={20} color={Colors.lilac[700]} />
            <Text style={styles.addIngredientsButtonText}>
              {selectedIngredients.length > 0
                ? "Add More Ingredients"
                : "Select Ingredients from Pantry"}
            </Text>
          </Pressable>
        </View>

        {/* Meal Type Section - Locked when from meal slot */}
        {isFromMealSlot ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meal Type</Text>
            <View style={styles.lockedMealTypeContainer}>
              <View style={styles.lockedMealTypeChip}>
                <Text style={styles.lockedMealTypeEmoji}>
                  {mealTypeOptions[0]?.emoji || "🍽️"}
                </Text>
                <Text style={styles.lockedMealTypeText}>
                  {mealTypeOptions[0]?.label || lockedMealType || "Meal"}
                </Text>
                <MaterialIcons
                  name="lock"
                  size={14}
                  color={Colors.gray[400]}
                  style={styles.lockIcon}
                />
              </View>
            </View>
          </View>
        ) : (
          <ChipSection
            title="Meal Type"
            options={MEAL_TYPE_OPTIONS}
            selectedValue={selectedMealType}
            onSelect={handleMealTypeSelect}
          />
        )}

        {/* Cooking Time Section */}
        <ChipSection
          title="Cooking time"
          options={COOKING_TIME_OPTIONS}
          selectedValue={selectedCookingTime}
          onSelect={setSelectedCookingTime}
        />

        {/* Calorie Range Section */}
        <ChipSection
          title="Calorie Range (kcal)"
          options={CALORIE_RANGE_OPTIONS}
          selectedValue={selectedCalorieRange}
          onSelect={setSelectedCalorieRange}
        />

        {/* User Preferences Section */}
        <UserPreferencesSection
          allergies={resolvedAllergies}
          dietPreferences={resolvedDietPreferences}
          cuisines={selectedCuisines}
          dislikedCuisines={dislikedCuisines}
        />
      </ScrollView>

      {/* Footer with Generate Button */}
      <View style={styles.footer}>
        <CustomButton
          containerStyle={styles.generateButton}
          onPress={handleGenerateRecipe}
        >
          <MaterialIcons name="auto-awesome" size={20} color="#fff" />
          <Text style={styles.generateButtonText}>GENERATE RECIPE</Text>
        </CustomButton>
      </View>

      {/* Ingredient Selection Modal */}
      <IngredientSelectionModal
        ref={ingredientModalRef}
        selectedIngredients={selectedIngredients}
        onApply={handleApplyIngredients}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  required: {
    color: Colors.semantic.error.main,
  },
  selectedCount: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.green[700],
  },
  selectedIngredientsContainer: {
    marginTop: 4,
  },
  selectedIngredientsScroll: {
    gap: 8,
  },
  selectedIngredientChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    backgroundColor: Colors.lilac[100],
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.lilac[300],
  },
  selectedIngredientImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background.surface,
  },
  selectedIngredientName: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.lilac[900],
    maxWidth: 100,
  },
  addIngredientsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lilac[300],
    borderStyle: "dashed",
    backgroundColor: Colors.lilac[100],
  },
  addIngredientsButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.lilac[700],
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.lilac[900],
    borderRadius: 99,
    paddingVertical: 16,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  // Locked meal type styles
  lockedMealTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  lockedMealTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.gray[100],
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  lockedMealTypeEmoji: {
    fontSize: 16,
  },
  lockedMealTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[600],
  },
  lockIcon: {
    marginLeft: 4,
  },
});
