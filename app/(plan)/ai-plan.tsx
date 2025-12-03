import { Colors } from "@/constants/theme";
import {
  AIMealTypeOption,
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
import { getUserOnboardingProfile } from "@/lib/supabase-onboarding";
import CustomButton from "@/shared/components/custom-button";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const selectedCuisines: string[] =
    onboardingData?.tastePreferences?.cuisines || [];
  const dislikedCuisines: string[] =
    onboardingData?.tastePreferences?.cuisine_dislikes || [];

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

  const handleGenerateRecipe = () => {
    // TODO: Implement recipe generation logic
    const ingredientNames = selectedIngredients.map((ing) => ing.name);
    console.log("Generate recipe with:", {
      ingredients: ingredientNames,
      mealType: selectedMealType,
      cookingTime: selectedCookingTime,
      calorieRange: selectedCalorieRange,
      allergies: selectedAllergies,
      dietPreferences: selectedDietPreferences,
      cuisines: selectedCuisines,
      dislikedCuisines,
    });
  };

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

        {/* Meal Type Section */}
        <ChipSection
          title="Meal Type"
          options={MEAL_TYPE_OPTIONS}
          selectedValue={selectedMealType}
          onSelect={setSelectedMealType}
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
