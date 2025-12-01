import { Colors } from "@/constants/theme";
import { LoadingState } from "@/features/home";
import { RecipeCard } from "@/features/home/components/recipe-card";
import { useAuthContext } from "@/hooks/use-auth-context";
import { MEAL_TYPES } from "@/lib/constants";
import { getIngredientInformation, Recipe } from "@/lib/spoonacular";
import {
  ComplexSearchOptions,
  searchRecipesComplex,
} from "@/lib/spoonacular-complex-search";
import { getUserOnboardingProfile } from "@/lib/supabase-onboarding";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PantryItem } from "../types";

interface RecipeIdeasViewProps {
  pantryItems: PantryItem[];
  onTotalResultsChange?: (total: number) => void;
}

type MealTypeFilter = "all" | string;

const FILTER_OPTIONS: { label: string; value: MealTypeFilter }[] = [
  { label: "All", value: "all" },
  { label: "Breakfast", value: MEAL_TYPES.BREAKFAST },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
];

export function RecipeIdeasView({
  pantryItems,
  onTotalResultsChange,
}: RecipeIdeasViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuthContext();
  const userId = session?.user?.id;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<MealTypeFilter>("all");

  // Cache allergy names to avoid refetching
  const allergyNamesCache = useRef<string[]>([]);
  const lastAllergyIds = useRef<string[]>([]);

  // Fetch onboarding data for user preferences
  const { data: onboardingData } = useQuery({
    queryKey: ["onboardingProfile", userId],
    queryFn: () => getUserOnboardingProfile(userId!),
    enabled: !!userId,
  });

  // Convert pantry items to ingredient string for API
  const ingredientsString = useMemo(() => {
    return pantryItems
      .map((item) => item.spoonacular_name || item.name)
      .filter((name) => name)
      .join(",");
  }, [pantryItems]);

  const fetchRecipes = useCallback(async () => {
    if (pantryItems.length === 0) return;

    setIsLoading(true);
    try {
      // Prepare user preferences from onboarding data
      const preferences = onboardingData?.tastePreferences;

      // Cuisines
      const cuisineParam = preferences?.cuisines?.join(",");

      // Diets
      const dietParam = preferences?.diet_preferences?.join(",");

      // Allergies / Dislikes (Fetch names from IDs)
      const allergyIds = preferences?.allergies_dislikes || [];
      let allergyNames: string[] = [];

      // Check if allergy IDs changed, if not use cached names
      const allergyIdsChanged =
        JSON.stringify(allergyIds) !== JSON.stringify(lastAllergyIds.current);

      if (allergyIds.length > 0 && allergyIdsChanged) {
        console.log("Fetching allergy ingredient names...");
        for (let i = 0; i < allergyIds.length; i++) {
          try {
            const id = parseInt(allergyIds[i]);
            if (!isNaN(id)) {
              const info = await getIngredientInformation(id);
              if (info.name) {
                allergyNames.push(info.name);
              }
            }
          } catch (e) {
            console.error(
              `Failed to fetch info for allergy ID ${allergyIds[i]}`,
              e
            );
          }
        }
        // Cache the results
        allergyNamesCache.current = allergyNames;
        lastAllergyIds.current = allergyIds;
      } else if (allergyIds.length > 0) {
        // Use cached names
        allergyNames = allergyNamesCache.current;
      }

      const excludeIngredientsParam = allergyNames.join(",");
      console.log("User preferences:", {
        cuisines: cuisineParam,
        diets: dietParam,
        excludeIngredients: excludeIngredientsParam,
      });

      const options: ComplexSearchOptions = {
        // Dynamic Parameters from Onboarding
        cuisine: cuisineParam,
        diet: dietParam,
        excludeIngredients: excludeIngredientsParam,

        // Pantry ingredients
        includeIngredients: ingredientsString,
        addRecipeNutrition: true,
        number: 20,
        sort: "max-used-ingredients",
        fillIngredients: true,
        ignorePantry: false,
      };

      if (selectedFilter !== "all") {
        options.type = selectedFilter;
      }

      const response = await searchRecipesComplex(options);
      setRecipes(response.results);
      onTotalResultsChange?.(response.totalResults);
    } catch (error) {
      console.error("Failed to fetch recipe ideas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    ingredientsString,
    selectedFilter,
    pantryItems.length,
    onboardingData,
    onTotalResultsChange,
  ]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleRecipePress = (recipe: Recipe) => {
    router.push(`/(meal)/${recipe.id}`);
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <View style={styles.cardContainer}>
      <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} />
    </View>
  );

  if (pantryItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Add ingredients to your pantry to get recipe ideas!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContainer}
        bounces={false}
      >
        {FILTER_OPTIONS.map((filter) => (
          <Pressable
            key={filter.value}
            style={[
              styles.filterButton,
              selectedFilter === filter.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.value && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Recipe Grid */}
      {isLoading ? (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <LoadingState count={8} />
        </ScrollView>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom * 2 + 52 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  banner: {
    backgroundColor: Colors.lilac[900],
    borderRadius: 12,
    padding: 16,
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    width: "100%",
    borderBottomColor: Colors.lilac[400],
    borderBottomWidth: 1,
    gap: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    height: 36,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  filterButtonActive: {
    backgroundColor: Colors.lilac[900],
    borderColor: Colors.lilac[900],
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardContainer: {
    width: "48%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
