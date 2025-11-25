import { searchRecipes, type Recipe } from "@/lib/spoonacular";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useState } from "react";
import type { GeneratedMealPlan, Meal, MealPlanData, MealType } from "../types";

interface UseMealPlanGeneratorOptions {
  selectedMealTypes: Record<MealType, boolean>;
}

const SPOONACULAR_MEAL_TYPES: Record<MealType, string> = {
  breakfast: "breakfast",
  lunch: "main course",
  dinner: "main course",
};

const DEFAULT_MEAL_FALLBACK_QUERIES: Record<MealType, string> = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
};

const SPOONACULAR_RATE_LIMIT_DELAY_MS = 2000;
let lastSpoonacularRequestTime = 0;
async function runRateLimitedSearch(
  query: string,
  mealType: MealType,
  filters: Parameters<typeof searchRecipes>[3]
) {
  const now = Date.now();
  const elapsed = now - lastSpoonacularRequestTime;
  if (elapsed < SPOONACULAR_RATE_LIMIT_DELAY_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, SPOONACULAR_RATE_LIMIT_DELAY_MS - elapsed)
    );
  }

  try {
    const response = await searchRecipes(query, 0, 4, filters);
    return response;
  } finally {
    lastSpoonacularRequestTime = Date.now();
  }
}

function mapRecipeToMeal(recipe: Recipe): Meal {
  const nutrients = recipe.nutrition?.nutrients || [];
  const findNutrient = (name: string) =>
    nutrients.find((n) => n.name === name)?.amount;

  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    imageType: recipe.image.split(".").pop() || "jpg",
    readyInMinutes: recipe.readyInMinutes,
    nutrition: {
      calories: findNutrient("Calories"),
      carbs: findNutrient("Carbohydrates"),
      fat: findNutrient("Fat"),
      protein: findNutrient("Protein"),
      nutrients: nutrients.map((n) => ({
        name: n.name,
        amount: n.amount,
        unitShort: n.unit,
      })),
    },
  };
}

export function useMealPlanGenerator({
  selectedMealTypes,
}: UseMealPlanGeneratorOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    selectedGoals,
    selectedAllergies,
    selectedCuisines,
    dislikedCuisines,
    selectedDietPreferences,
  } = useOnboarding();

  const buildFilters = (
    mealType: MealType,
    {
      includeDiet = true,
      includeCuisine = true,
      includeAllergies = true,
    }: {
      includeDiet?: boolean;
      includeCuisine?: boolean;
      includeAllergies?: boolean;
    }
  ) => ({
    type: SPOONACULAR_MEAL_TYPES[mealType],
    diet:
      includeDiet && selectedDietPreferences.length > 0
        ? selectedDietPreferences.join(",")
        : undefined,
    cuisine:
      includeCuisine && selectedCuisines.length > 0
        ? selectedCuisines.join(",")
        : undefined,
    excludeIngredients:
      includeAllergies && selectedAllergies.length > 0
        ? selectedAllergies.join(",")
        : undefined,
  });

  async function fetchMealsWithFallback(
    mealType: MealType,
    query: string
  ): Promise<{ results: Meal[]; totalResults: number; strategy: string }> {
    const attempts = [
      {
        label: "ai-query-full",
        query,
        filters: buildFilters(mealType, {
          includeDiet: true,
          includeCuisine: true,
          includeAllergies: true,
        }),
      },
      {
        label: "ai-query-basic",
        query,
        filters: buildFilters(mealType, {
          includeDiet: false,
          includeCuisine: false,
          includeAllergies: true,
        }),
      },
      {
        label: "ai-query-minimal",
        query,
        filters: buildFilters(mealType, {
          includeDiet: false,
          includeCuisine: false,
          includeAllergies: false,
        }),
      },
      {
        label: "default-query-basic",
        query: DEFAULT_MEAL_FALLBACK_QUERIES[mealType],
        filters: buildFilters(mealType, {
          includeDiet: false,
          includeCuisine: false,
          includeAllergies: true,
        }),
      },
      {
        label: "default-query-minimal",
        query: DEFAULT_MEAL_FALLBACK_QUERIES[mealType],
        filters: buildFilters(mealType, {
          includeDiet: false,
          includeCuisine: false,
          includeAllergies: false,
        }),
      },
      {
        label: "catch-all-basic",
        query: "",
        filters: buildFilters(mealType, {
          includeDiet: false,
          includeCuisine: false,
          includeAllergies: true,
        }),
      },
      {
        label: "catch-all-minimal",
        query: "",
        filters: buildFilters(mealType, {
          includeDiet: false,
          includeCuisine: false,
          includeAllergies: false,
        }),
      },
    ];

    let lastError: unknown = null;

    for (const attempt of attempts) {
      try {
        const { recipes, totalResults } = await runRateLimitedSearch(
          attempt.query,
          mealType,
          attempt.filters
        );

        if (recipes.length > 0) {
          return {
            results: recipes.map(mapRecipeToMeal),
            totalResults,
            strategy: attempt.label,
          };
        }
      } catch (error: any) {
        lastError = error;
        console.warn(
          `Meal plan search attempt failed (${attempt.label})`,
          error
        );

        // If we hit a rate limit (429), wait extra time before next attempt
        if (error.message?.includes("429") || error.status === 429) {
          console.log("Rate limit hit, waiting 5s before retry...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    console.warn(
      `No recipes found for ${mealType} even after fallbacks. Returning empty results instead of throwing.`,
      lastError
    );

    return {
      results: [],
      totalResults: 0,
      strategy: "none-found",
    };
  }

  async function generateMealPlan(): Promise<GeneratedMealPlan> {
    setIsGenerating(true);

    try {
      // 1. Get meal ideas from AI
      const activeMealTypes = (
        Object.keys(selectedMealTypes) as MealType[]
      ).filter((type) => selectedMealTypes[type]);

      const ideasResponse = await fetch("/api/generate-meal-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: selectedGoals,
          allergies: selectedAllergies,
          cuisines: selectedCuisines,
          dislikedCuisines: dislikedCuisines,
          dietPreferences: selectedDietPreferences,
          mealTypes: activeMealTypes,
        }),
      });

      if (!ideasResponse.ok) {
        throw new Error("Failed to generate meal ideas");
      }

      const ideas = await ideasResponse.json();

      const mealPlan: GeneratedMealPlan = {
        breakfast: { results: [], totalResults: 0 },
        lunch: { results: [], totalResults: 0 },
        dinner: { results: [], totalResults: 0 },
      };

      // For logging
      const generatedLog = {
        aiSuggestions: ideas,
        spoonacularResults: {} as Record<string, string[]>,
        strategies: {} as Record<string, string>,
      };

      // 2. Fetch recipes for each meal type
      for (let i = 0; i < activeMealTypes.length; i++) {
        const type = activeMealTypes[i];
        const query = ideas[type] || DEFAULT_MEAL_FALLBACK_QUERIES[type];

        // Add delay if not the first request to avoid rate limits
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const { results, totalResults, strategy } =
          await fetchMealsWithFallback(type, query);

        mealPlan[type] = {
          results,
          totalResults,
        };

        generatedLog.spoonacularResults[type] = results.map((m) => m.title);
        generatedLog.strategies[type] = strategy;
      }

      console.log(
        "Generated Meal Plan Details:",
        JSON.stringify(generatedLog, null, 2)
      );

      return mealPlan;
    } catch (error) {
      console.error("Error generating meal plan:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }

  async function generateSingleMealType(type: MealType): Promise<MealPlanData> {
    setIsGenerating(true);
    try {
      const ideasResponse = await fetch("/api/generate-meal-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: selectedGoals,
          allergies: selectedAllergies,
          cuisines: selectedCuisines,
          dislikedCuisines: dislikedCuisines,
          dietPreferences: selectedDietPreferences,
          mealTypes: [type],
        }),
      });

      if (!ideasResponse.ok) {
        throw new Error("Failed to generate meal ideas");
      }

      const ideas = await ideasResponse.json();
      const query = ideas[type] || DEFAULT_MEAL_FALLBACK_QUERIES[type];

      const { results, totalResults, strategy } = await fetchMealsWithFallback(
        type,
        query
      );

      console.log(
        "Generated Single Meal Details:",
        JSON.stringify(
          {
            type,
            aiSuggestion: query,
            spoonacularResults: results.map((m) => m.title),
            strategy,
          },
          null,
          2
        )
      );

      return {
        results,
        totalResults,
      };
    } catch (error) {
      console.error("Error generating single meal type:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }

  return {
    generateMealPlan,
    generateSingleMealType,
    isGenerating,
  };
}
