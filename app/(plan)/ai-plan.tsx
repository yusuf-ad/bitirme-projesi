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
  DisplayCookingSkill,
  DisplayGoal,
  IngredientSelectionModal,
  IngredientSelectionModalHandle,
  MEAL_TYPE_OPTIONS,
  SelectedIngredient,
  UserPreferencesSection,
} from "@/features/meal-plan";
import { goalOptions } from "@/features/onboarding/sections/goals/goals-content";
import { useAuthContext } from "@/hooks/use-auth-context";
import {
  resolveAllergiesFast,
  resolveDietPreferences,
} from "@/lib/allergies-diet-helpers";
import { parseIngredients, Recipe } from "@/lib/spoonacular";
import { supabase } from "@/lib/supabase";
import { getUserOnboardingProfile } from "@/lib/supabase-onboarding";
import { generateAPIUrl } from "@/lib/utils";
import CustomButton from "@/shared/components/custom-button";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
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

// Cooking skill options (matching those in cooking-skill.tsx)
const COOKING_SKILL_OPTIONS: DisplayCookingSkill[] = [
  { id: "beginner", emoji: "🍳", label: "Novice" },
  { id: "basic", emoji: "🥘", label: "Basic" },
  { id: "intermediate", emoji: "👨‍🍳", label: "Intermediate" },
  { id: "advanced", emoji: "🍰", label: "Advanced" },
];

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

export default function AiPlan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { session } = useAuthContext();
  const userId = session?.user?.id;

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

  // Extract goals from onboarding data
  const selectedGoalIds = useMemo(
    () => onboardingData?.goals?.goal_ids || [],
    [onboardingData?.goals?.goal_ids]
  );

  // Resolve goals to display format
  const resolvedGoals: DisplayGoal[] = useMemo(
    () =>
      selectedGoalIds
        .map((id) => {
          const goal = goalOptions.find((g) => g.id === id);
          return goal ? { id: goal.id, title: goal.title } : null;
        })
        .filter((g): g is DisplayGoal => g !== null),
    [selectedGoalIds]
  );

  // Extract cooking skill from onboarding data
  const selectedCookingSkillId = useMemo(
    () => onboardingData?.tastePreferences?.cooking_skill_level || null,
    [onboardingData?.tastePreferences?.cooking_skill_level]
  );

  // Resolve cooking skill to display format
  const resolvedCookingSkill: DisplayCookingSkill | null = useMemo(
    () =>
      selectedCookingSkillId
        ? COOKING_SKILL_OPTIONS.find((s) => s.id === selectedCookingSkillId) ||
          null
        : null,
    [selectedCookingSkillId]
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
  const [selectedMealType, setSelectedMealType] =
    useState<AIMealTypeOption>("breakfast");
  const [selectedCookingTime, setSelectedCookingTime] =
    useState<CookingTimeOption>("<15");
  const [selectedCalorieRange, setSelectedCalorieRange] =
    useState<CalorieRangeOption>("<200");

  // View state management
  const [viewState, setViewState] = useState<ViewState>("form");
  const [generatedRecipe, setGeneratedRecipe] =
    useState<AIGeneratedRecipe | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Set initial meal type from params
  useEffect(() => {
    if (params.mealType) {
      const mealType = params.mealType as string;
      if (["breakfast", "lunch", "dinner"].includes(mealType)) {
        setSelectedMealType(mealType as AIMealTypeOption);
      }
    }
  }, [params.mealType]);

  // Lock meal type selection if navigated from a specific meal slot
  const lockedMealType = useMemo(() => {
    const mt = params.mealType as string | undefined;
    return mt && ["breakfast", "lunch", "dinner"].includes(mt)
      ? (mt as AIMealTypeOption)
      : null;
  }, [params.mealType]);

  const mealTypeOptions = useMemo(() => {
    return lockedMealType
      ? MEAL_TYPE_OPTIONS.filter((opt) => opt.id === lockedMealType)
      : MEAL_TYPE_OPTIONS;
  }, [lockedMealType]);

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
      // Convert goal objects to title strings for API
      const goalTitles = resolvedGoals.map((g) => g.title.replace("\n", " "));

      const response = await fetch(generateAPIUrl("/api/generate-recipe"), {
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
          goals: goalTitles,
          cookingSkill: resolvedCookingSkill?.id || null,
          userId: userId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recipe");
      }

      let recipe: AIGeneratedRecipe = await response.json();

      // Enrich ingredients with Spoonacular IDs and images
      if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) {
        try {
          const ingredientStrings = recipe.extendedIngredients.map(
            (ing) => `${ing.amount} ${ing.unit || ""} ${ing.name}`
          );

          console.log("Parsing ingredients for AI recipe:", ingredientStrings);
          const parsedIngredients = await parseIngredients(ingredientStrings);

          recipe.extendedIngredients = recipe.extendedIngredients.map(
            (ing, index) => {
              const parsed = parsedIngredients[index];
              if (parsed && parsed.id) {
                return {
                  ...ing,
                  id: parsed.id,
                  name: parsed.name,
                  image: parsed.image,
                  aisle: parsed.aisle,
                  amount: parsed.amount,
                  unit: parsed.unit,
                  original: ingredientStrings[index],
                };
              }
              return ing;
            }
          );
        } catch (err) {
          console.warn(
            "Failed to parse ingredients, using AI generated ones:",
            err
          );
        }
      }

      // Persist AI generated recipe for the user in Supabase
      if (userId && recipe?.id) {
        try {
          const calories = recipe.nutrition?.nutrients?.find(
            (n) => n.name.toLowerCase() === "calories"
          )?.amount;
          const protein = recipe.nutrition?.nutrients?.find(
            (n) => n.name.toLowerCase() === "protein"
          )?.amount;
          const carbs = recipe.nutrition?.nutrients?.find(
            (n) => n.name.toLowerCase() === "carbohydrates"
          )?.amount;
          const fat = recipe.nutrition?.nutrients?.find(
            (n) => n.name.toLowerCase() === "fat"
          )?.amount;

          const ingredientsPayload = (recipe.extendedIngredients || []).map(
            (ing: any) => ({
              id: ing.id,
              name: ing.name,
              original: ing.original,
              amount: ing.amount,
              unit: ing.unit,
            })
          );

          const instructionsPayload = (
            recipe.analyzedInstructions || []
          ).flatMap((section) =>
            (section.steps || []).map((step) => ({
              number: step.number,
              text: step.step,
            }))
          );

          const upsertPayload = {
            user_id: userId,
            recipe_id: recipe.id,
            title: recipe.title,
            summary: recipe.summary ?? null,
            image_url: recipe.image ?? null,
            ready_in_minutes: recipe.readyInMinutes ?? null,
            servings: recipe.servings ?? null,
            cuisines: (recipe.cuisines as string[]) ?? [],
            dish_types: (recipe.dishTypes as string[]) ?? [],
            diets: (recipe.diets as string[]) ?? [],
            ingredients: ingredientsPayload,
            instructions: instructionsPayload,
            nutrition: recipe.nutrition ?? {},
            calories_per_serving: calories ?? null,
            protein_per_serving: protein ?? null,
            carbs_per_serving: carbs ?? null,
            fat_per_serving: fat ?? null,
            updated_at: new Date().toISOString(),
          };

          await supabase
            .from("ai_generated_recipes")
            .upsert(upsertPayload, { onConflict: "user_id,recipe_id" });
        } catch (e) {
          console.error("Failed to persist AI recipe:", e);
        }
      }

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
    resolvedGoals,
    resolvedCookingSkill,
    userId,
  ]);

  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    await handleGenerateRecipe();
  }, [handleGenerateRecipe]);

  const handleConfirmRecipe = useCallback(() => {
    if (!generatedRecipe) return;

    // Convert AI-generated recipe to Meal format for preview
    const aiMeal = {
      id: generatedRecipe.id,
      title: generatedRecipe.title,
      image: generatedRecipe.image || "",
      readyInMinutes: generatedRecipe.readyInMinutes ?? undefined,
      servings: generatedRecipe.servings ?? undefined,
      isAiGenerated: true,
      nutrition: {
        calories: generatedRecipe.nutrition?.nutrients?.find(
          (n) => n.name.toLowerCase() === "calories"
        )?.amount,
        protein: generatedRecipe.nutrition?.nutrients?.find(
          (n) => n.name.toLowerCase() === "protein"
        )?.amount,
        carbs: generatedRecipe.nutrition?.nutrients?.find(
          (n) => n.name.toLowerCase() === "carbohydrates"
        )?.amount,
        fat: generatedRecipe.nutrition?.nutrients?.find(
          (n) => n.name.toLowerCase() === "fat"
        )?.amount,
      },
    };

    // Create or merge with existing meal plan data
    const mealType = selectedMealType as "breakfast" | "lunch" | "dinner";

    // Parse existing meal plan data if provided
    let baseMealPlan = {
      breakfast: { results: [], totalResults: 0 },
      lunch: { results: [], totalResults: 0 },
      dinner: { results: [], totalResults: 0 },
    };

    if (params.existingMealPlanData) {
      try {
        const existing = JSON.parse(params.existingMealPlanData as string);
        baseMealPlan = {
          breakfast: existing.breakfast || { results: [], totalResults: 0 },
          lunch: existing.lunch || { results: [], totalResults: 0 },
          dinner: existing.dinner || { results: [], totalResults: 0 },
        };
      } catch (e) {
        console.error("Error parsing existing meal plan data:", e);
      }
    }

    // Add the new AI meal to the appropriate slot
    const mealPlanData = {
      ...baseMealPlan,
      [mealType]: { results: [aiMeal], totalResults: 1 },
    };

    // Handle selections preservation
    let selections = {};
    if (params.currentSelections) {
      try {
        selections = JSON.parse(params.currentSelections as string);
      } catch (e) {
        console.error("Error parsing current selections:", e);
      }
    }
    // Update selection for the generated meal type to 0 (since we replaced results with [aiMeal])
    selections = { ...selections, [mealType]: 0 };

    // Get dates from params or use today
    const startDate =
      (params.startDate as string) || new Date().toISOString().split("T")[0];
    const endDate = (params.endDate as string) || startDate;

    router.push({
      pathname: "/(plan)/preview",
      params: {
        mealPlanData: JSON.stringify(mealPlanData),
        startDate,
        endDate,
        initialSelections: JSON.stringify(selections),
      },
    });
  }, [
    generatedRecipe,
    selectedMealType,
    params.startDate,
    params.endDate,
    params.existingMealPlanData,
    params.currentSelections,
    router,
  ]);

  const handleBackFromPreview = useCallback(() => {
    setViewState("form");
    setGeneratedRecipe(null);
  }, []);

  // Handle image generation completion
  const handleImageGenerated = useCallback(
    (imageUrl: string) => {
      if (generatedRecipe) {
        setGeneratedRecipe({ ...generatedRecipe, image: imageUrl });
      }
    },
    [generatedRecipe]
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
        onConfirm={handleConfirmRecipe}
        onRegenerate={handleRegenerate}
        onBack={handleBackFromPreview}
        mealSlot={params.mealSlot as string | undefined}
        isRegenerating={isRegenerating}
        onImageGenerated={handleImageGenerated}
      />
    );
  }

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
        <Text style={styles.headerTitle}>AI Recipes Generator</Text>
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

        {/* Meal Type Section (locked when coming from Breakfast/Lunch/Dinner) */}
        <ChipSection
          title="Meal Type"
          options={mealTypeOptions}
          selectedValue={selectedMealType}
          onSelect={lockedMealType ? () => {} : setSelectedMealType}
        />

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
          goals={resolvedGoals}
          cookingSkill={resolvedCookingSkill}
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
});
