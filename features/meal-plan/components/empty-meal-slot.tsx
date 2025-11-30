import { Colors } from "@/constants/theme";
import { IngredientModal } from "@/features/home/components/ingredient-modal";
import { useAuthContext } from "@/hooks/use-auth-context";
import type { Ingredient } from "@/lib/spoonacular";
import { getRandomRecipes } from "@/lib/spoonacular";
import { supabase } from "@/lib/supabase";
import CustomButton from "@/shared/components/custom-button";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle
} from "react-native-reanimated";

interface EmptyMealSlotProps {
  mealType: string;
  mealTime: string;
  mealIcon: ImageSourcePropType;
  mealSlot: "breakfast" | "lunch" | "dinner";
  selectedDate: Date;
  onMealAdded?: () => void;
  scrollY: SharedValue<number>;
}

type CookingTime = "<15" | "15-29" | "30-60";
type CalorieRange =
  | "<200"
  | "200-399"
  | "400-599"
  | "600-1000"
  | "1000+"
  | "flexible";

export function EmptyMealSlot({
  mealType,
  mealTime,
  mealIcon,
  mealSlot,
  selectedDate,
  onMealAdded,
  scrollY,
}: EmptyMealSlotProps) {
  const { session } = useAuthContext();
  const queryClient = useQueryClient();
  const aiSheetRef = useRef<BottomSheetModal>(null);
  const ingredientModalRef = useRef<BottomSheetModal>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    []
  );
  const [cookingTime, setCookingTime] = useState<CookingTime | null>(null);
  const [calorieRange, setCalorieRange] = useState<CalorieRange>("flexible");
  const [aiError, setAiError] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Animated styles for collapsible content
  const contentAnimatedStyle = useAnimatedStyle(() => {
    // Expand as user scrolls down (0 -> 150px scroll)
    const height = interpolate(
      scrollY.value,
      [0, 150],
      [0, 160], // 0 height at top, 160 height when scrolled
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [50, 150], // Start fading in after 50px scroll
      [0, 1],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [0, 150],
      [0.8, 1],
      Extrapolation.CLAMP
    );

    return {
      height,
      opacity,
      transform: [{ scale }],
      overflow: "hidden",
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    // Animate container padding/gap when collapsed
    const paddingBottom = interpolate(
      scrollY.value,
      [0, 150],
      [0, 16],
      Extrapolation.CLAMP
    );

    return {
      paddingBottom,
    };
  });

  const snapPoints = useMemo(() => ["75%", "90%"], []);

  const handleBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/(app)/recipes",
      params: { mealSlot },
    });
  };

  const handleOpenAiSheet = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAiError(null);
    aiSheetRef.current?.present();
  };

  const handleOpenIngredientModal = () => {
    aiSheetRef.current?.dismiss();
    setTimeout(() => {
      ingredientModalRef.current?.present();
    }, 300);
  };

  const handleIngredientsSelect = (ingredients: Ingredient[]) => {
    setSelectedIngredients(ingredients);
    setTimeout(() => {
      aiSheetRef.current?.present();
    }, 300);
  };

  const handleGenerateAiSuggestion = async () => {
    if (!session?.user?.id) {
      Alert.alert(
        "Login Required",
        "You must be logged in to generate a recipe."
      );
      return;
    }

    setIsGeneratingAi(true);
    setAiError(null);

    try {
      // RapidAPI üzerinden mevcut Spoonacular helper'ını kullan
      const includeIngredients =
        selectedIngredients.length > 0
          ? selectedIngredients.map((i) => i.name).join(",")
          : undefined;

      const randomRecipes = await getRandomRecipes(10, {
        type: mealSlot,
        includeIngredients,
        excludeIngredients: "pork",
      });

      if (!randomRecipes || randomRecipes.length === 0) {
        setAiError(
          "No recipes found matching your filters. Please adjust your filters."
        );
        return;
      }

      // Cooking time ve kalori filtrelerini client-side uygula
      const filteredByTime = randomRecipes.filter((recipe) => {
        if (!cookingTime || !recipe.readyInMinutes) return true;
        if (cookingTime === "<15") return recipe.readyInMinutes < 15;
        if (cookingTime === "15-29")
          return recipe.readyInMinutes >= 15 && recipe.readyInMinutes <= 29;
        return recipe.readyInMinutes >= 30 && recipe.readyInMinutes <= 60;
      });

      const filteredByCalories = filteredByTime.filter((recipe) => {
        if (calorieRange === "flexible") return true;
        const calories =
          recipe.nutrition?.nutrients?.find(
            (n) => n.name.toLowerCase() === "calories"
          )?.amount || null;
        if (calories == null) return true;

        if (calorieRange === "<200") return calories < 200;
        if (calorieRange === "200-399")
          return calories >= 200 && calories <= 399;
        if (calorieRange === "400-599")
          return calories >= 400 && calories <= 599;
        if (calorieRange === "600-1000")
          return calories >= 600 && calories <= 1000;
        if (calorieRange === "1000+") return calories >= 1000;
        return true;
      });

      const finalRecipes =
        filteredByCalories.length > 0 ? filteredByCalories : filteredByTime;

      if (!finalRecipes || finalRecipes.length === 0) {
        setAiError(
          "No recipes found matching your filters. Please adjust your filters."
        );
        return;
      }

      // Rastgele bir tarif seç
      const recipe =
        finalRecipes[Math.floor(Math.random() * finalRecipes.length)];

      // Get current meal plan
      const dateString = selectedDate.toISOString().split("T")[0];
      const { data: plans } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", session.user.id)
        .lte("start_date", dateString)
        .gte("end_date", dateString)
        .limit(1);

      let mealPlanId = plans?.[0]?.id;

      // Create meal plan if doesn't exist
      if (!mealPlanId) {
        const { data: newPlan, error: planError } = await supabase
          .from("meal_plans")
          .insert({
            user_id: session.user.id,
            name: `Meal Plan - ${dateString}`,
            start_date: dateString,
            end_date: dateString,
          })
          .select()
          .single();

        if (planError) throw planError;
        mealPlanId = newPlan.id;
      }

      // Extract nutrition and round to integers for DB schema
      const caloriesRaw =
        recipe.nutrition?.nutrients?.find(
          (n: any) => n.name.toLowerCase() === "calories"
        )?.amount ?? null;
      const carbsRaw =
        recipe.nutrition?.nutrients?.find(
          (n: any) => n.name.toLowerCase() === "carbohydrates"
        )?.amount ?? null;
      const proteinRaw =
        recipe.nutrition?.nutrients?.find(
          (n: any) => n.name.toLowerCase() === "protein"
        )?.amount ?? null;
      const fatRaw =
        recipe.nutrition?.nutrients?.find(
          (n: any) => n.name.toLowerCase() === "fat"
        )?.amount ?? null;

      const calories =
        typeof caloriesRaw === "number" ? Math.round(caloriesRaw) : null;
      const carbs = typeof carbsRaw === "number" ? Math.round(carbsRaw) : null;
      const protein =
        typeof proteinRaw === "number" ? Math.round(proteinRaw) : null;
      const fat = typeof fatRaw === "number" ? Math.round(fatRaw) : null;

      // Save meal item
      const { error: itemError } = await supabase
        .from("meal_plan_items")
        .insert({
          meal_plan_id: mealPlanId,
          spoonacular_recipe_id: recipe.id,
          recipe_name: recipe.title,
          recipe_image_url: recipe.image,
          calories_per_serving: calories,
          carbs_per_serving: carbs,
          protein_per_serving: protein,
          fat_per_serving: fat,
          ready_in_minutes: recipe.readyInMinutes,
          meal_date: dateString,
          meal_type: mealSlot,
        });

      if (itemError) throw itemError;

      // Invalidate queries to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["meal-plans"] });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success!", "Recipe added.");
      aiSheetRef.current?.dismiss();
    } catch (error) {
      console.error("AI suggestion error", error);
      setAiError("Could not generate recipe. Please try again.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <>
      <Animated.View style={containerAnimatedStyle}>
        <Pressable
          style={({ pressed }) => [
            styles.container,
            pressed && styles.containerPressed,
          ]}
          onPress={handlePress}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={styles.mealIconContainer}>
                <Image source={mealIcon} style={styles.mealIcon} />
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealType}>{mealType}</Text>
                <Text style={styles.mealTime}>{mealTime}</Text>
              </View>
            </View>

            <Pressable style={styles.aiButton} onPress={handleOpenAiSheet}>
              <MaterialIcons
                name="auto-awesome"
                size={18}
                color={Colors.lilac[900]}
              />
              <Text style={styles.aiButtonText}>AI</Text>
            </Pressable>
          </View>

          {/* Empty State Content - Animated */}
          <Animated.View style={contentAnimatedStyle}>
            <View style={styles.emptyContent}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>🍽️</Text>
              </View>
              <Text style={styles.emptyTitle}>{mealType} not added yet</Text>
              <Text style={styles.emptyDescription}>
                Tap to add a meal from the recipes page
              </Text>
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>

      <BottomSheetModal
        ref={aiSheetRef}
        snapPoints={snapPoints}
        enableOverDrag={false}
        backdropComponent={handleBackdrop}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetScrollView style={styles.aiSheetContainer}>
          <View style={styles.aiHeader}>
            <View>
              <Text style={styles.aiTitle}>AI Recipes Generator</Text>
              <Text style={styles.aiSubtitle}>
                Generate recipe for {mealType} with filters
              </Text>
            </View>
            <Pressable onPress={() => aiSheetRef.current?.dismiss()}>
              <MaterialIcons
                name="close"
                size={24}
                color={Colors.text.primary}
              />
            </Pressable>
          </View>

          {/* Key Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Key Ingredients *</Text>
            <Pressable
              style={styles.ingredientButton}
              onPress={handleOpenIngredientModal}
            >
              <Ionicons name="search" size={18} color={Colors.lilac[700]} />
              <Text style={styles.ingredientButtonText}>
                {selectedIngredients.length > 0
                  ? `${selectedIngredients.length} ingredients selected`
                  : "Search ingredients..."}
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={Colors.gray[400]}
              />
            </Pressable>
            {selectedIngredients.length > 0 && (
              <View style={styles.selectedChipsContainer}>
                {selectedIngredients.map((ingredient) => (
                  <View key={ingredient.id} style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>
                      {ingredient.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Cooking Time */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Cooking time</Text>
            <View style={styles.chipsContainer}>
              <Pressable
                style={[
                  styles.chip,
                  cookingTime === "<15" && styles.chipSelected,
                ]}
                onPress={() =>
                  setCookingTime(cookingTime === "<15" ? null : "<15")
                }
              >
                <Text style={styles.chipEmoji}>🥪</Text>
                <Text
                  style={[
                    styles.chipText,
                    cookingTime === "<15" && styles.chipTextSelected,
                  ]}
                >
                  {"<15 min"}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.chip,
                  cookingTime === "15-29" && styles.chipSelected,
                ]}
                onPress={() =>
                  setCookingTime(cookingTime === "15-29" ? null : "15-29")
                }
              >
                <Text style={styles.chipEmoji}>🥗</Text>
                <Text
                  style={[
                    styles.chipText,
                    cookingTime === "15-29" && styles.chipTextSelected,
                  ]}
                >
                  15-29 min
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.chip,
                  cookingTime === "30-60" && styles.chipSelected,
                ]}
                onPress={() =>
                  setCookingTime(cookingTime === "30-60" ? null : "30-60")
                }
              >
                <Text style={styles.chipEmoji}>🍲</Text>
                <Text
                  style={[
                    styles.chipText,
                    cookingTime === "30-60" && styles.chipTextSelected,
                  ]}
                >
                  30-60 min
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Calorie Range */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Calorie Range (kcal)</Text>
            <View style={styles.chipsContainer}>
              <Pressable
                style={[
                  styles.chip,
                  calorieRange === "<200" && styles.chipSelected,
                ]}
                onPress={() => setCalorieRange("<200")}
              >
                <Text style={styles.chipEmoji}>💛</Text>
                <Text
                  style={[
                    styles.chipText,
                    calorieRange === "<200" && styles.chipTextSelected,
                  ]}
                >
                  {"<200"}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.chip,
                  calorieRange === "200-399" && styles.chipSelected,
                ]}
                onPress={() => setCalorieRange("200-399")}
              >
                <Text style={styles.chipEmoji}>🔥</Text>
                <Text
                  style={[
                    styles.chipText,
                    calorieRange === "200-399" && styles.chipTextSelected,
                  ]}
                >
                  200-399
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.chip,
                  calorieRange === "400-599" && styles.chipSelected,
                ]}
                onPress={() => setCalorieRange("400-599")}
              >
                <Text style={styles.chipEmoji}>🍎</Text>
                <Text
                  style={[
                    styles.chipText,
                    calorieRange === "400-599" && styles.chipTextSelected,
                  ]}
                >
                  400-599
                </Text>
              </Pressable>
            </View>
            <View style={styles.chipsContainer}>
              <Pressable
                style={[
                  styles.chip,
                  calorieRange === "600-1000" && styles.chipSelected,
                ]}
                onPress={() => setCalorieRange("600-1000")}
              >
                <Text style={styles.chipEmoji}>🔥</Text>
                <Text
                  style={[
                    styles.chipText,
                    calorieRange === "600-1000" && styles.chipTextSelected,
                  ]}
                >
                  600-1000
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.chip,
                  calorieRange === "1000+" && styles.chipSelected,
                ]}
                onPress={() => setCalorieRange("1000+")}
              >
                <Text style={styles.chipEmoji}>💜</Text>
                <Text
                  style={[
                    styles.chipText,
                    calorieRange === "1000+" && styles.chipTextSelected,
                  ]}
                >
                  1000+
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.chip,
                  calorieRange === "flexible" && styles.chipSelected,
                ]}
                onPress={() => setCalorieRange("flexible")}
              >
                <Text style={styles.chipEmoji}>🔄</Text>
                <Text
                  style={[
                    styles.chipText,
                    calorieRange === "flexible" && styles.chipTextSelected,
                  ]}
                >
                  Flexible
                </Text>
              </Pressable>
            </View>
          </View>

          {aiError && <Text style={styles.aiError}>{aiError}</Text>}

          <CustomButton
            containerStyle={styles.generateButton}
            onPress={handleGenerateAiSuggestion}
            disabled={isGeneratingAi}
          >
            {isGeneratingAi ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <ActivityIndicator color="#fff" />
                <Text style={styles.generateButtonText}>Generating...</Text>
              </View>
            ) : (
              <Text style={styles.generateButtonText}>✨ GENERATE RECIPE</Text>
            )}
          </CustomButton>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <IngredientModal
        ref={ingredientModalRef}
        onIngredientsSelect={handleIngredientsSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    borderRadius: 12,
    borderStyle: "dashed",
  },
  containerPressed: {
    opacity: 0.7,
    borderColor: Colors.lilac[500],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[200],
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    justifyContent: "center",
    alignItems: "center",
  },
  mealIcon: {
    width: 40,
    height: 40,
  },
  mealInfo: {
    justifyContent: "center",
  },
  mealType: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 21,
    color: Colors.text.primary,
  },
  mealTime: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 21,
    color: Colors.gray[400],
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.lilac[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "center",
  },
  emptyDescription: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
    maxWidth: 240,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lilac[300],
    backgroundColor: Colors.lilac[100],
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.lilac[900],
  },
  sheetHandle: {
    backgroundColor: Colors.lilac[300],
  },
  aiSheetContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  aiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 8,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  aiSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  ingredientButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    borderRadius: 12,
    backgroundColor: Colors.background.surface,
  },
  ingredientButtonText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  selectedChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  selectedChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.lilac[100],
  },
  selectedChipText: {
    fontSize: 12,
    color: Colors.lilac[900],
    fontWeight: "500",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    backgroundColor: Colors.background.surface,
  },
  chipSelected: {
    backgroundColor: Colors.lilac[100],
    borderColor: Colors.lilac[500],
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: Colors.lilac[900],
    fontWeight: "600",
  },
  aiError: {
    fontSize: 13,
    color: Colors.semantic.error.main,
    marginBottom: 16,
    textAlign: "center",
  },
  generateButton: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 18,
    backgroundColor: Colors.lilac[900],
  },
  generateButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
