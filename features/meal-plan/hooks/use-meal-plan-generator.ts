import { CUISINES } from "@/lib/constants";
import { searchRecipes } from "@/lib/spoonacular";
import { useState } from "react";
import type { GeneratedMealPlan, Meal, MealType } from "../types";

interface UseMealPlanGeneratorOptions {
  selectedMealTypes: Record<MealType, boolean>;
}

export function useMealPlanGenerator({
  selectedMealTypes,
}: UseMealPlanGeneratorOptions) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function generateMealPlan(): Promise<GeneratedMealPlan> {
    setIsGenerating(true);

    try {
      const mealPlan: GeneratedMealPlan = {
        breakfast: {
          results: [],
          totalResults: 0,
        },
        lunch: {
          results: [],
          totalResults: 0,
        },
        dinner: {
          results: [],
          totalResults: 0,
        },
      };

      const includedCuisines = [CUISINES.MEDITERRANEAN, CUISINES.ITALIAN];
      const excludedIngredients = ["pork", "shellfish"];

      // Different ingredients for each meal type
      const mealTypesConfig: {
        type: MealType;
        includedIngredients: string[];
      }[] = [
        {
          type: "breakfast",
          includedIngredients: ["eggs"],
        },
        {
          type: "lunch",
          includedIngredients: ["chicken"],
        },
        {
          type: "dinner",
          includedIngredients: ["fish"],
        },
      ];

      // Fetch recipes only for selected meal types
      const selectedMealTypesConfig = mealTypesConfig.filter(
        (meal) => selectedMealTypes[meal.type]
      );

      for (const meal of selectedMealTypesConfig) {
        const includedCuisinesString = includedCuisines.join(",");
        const excludedIngredientsString = excludedIngredients.join(",");
        const includedIngredientsString = meal.includedIngredients.join(",");

        const { recipes, totalResults } = await searchRecipes("", 0, 12, {
          cuisine: includedCuisinesString,
          excludeIngredients: excludedIngredientsString,
          type: meal.type,
          includeIngredients: includedIngredientsString,
        });

        // Process results to extract only necessary fields
        const processedResults = recipes.map((recipe: any) => {
          let calories: number | undefined;
          let carbs: number | undefined;
          let protein: number | undefined;
          let fat: number | undefined;

          // Try to extract nutrition values from nutrition.nutrients array
          if (Array.isArray(recipe?.nutrition?.nutrients)) {
            const calorieNutrient = recipe.nutrition.nutrients.find(
              (nutrient: any) =>
                typeof nutrient?.name === "string" &&
                nutrient.name.toLowerCase() === "calories"
            );
            if (calorieNutrient?.amount) {
              calories = calorieNutrient.amount;
            }

            const carbsNutrient = recipe.nutrition.nutrients.find(
              (nutrient: any) =>
                typeof nutrient?.name === "string" &&
                nutrient.name.toLowerCase() === "carbohydrates"
            );
            if (carbsNutrient?.amount) {
              carbs = carbsNutrient.amount;
            }

            const proteinNutrient = recipe.nutrition.nutrients.find(
              (nutrient: any) =>
                typeof nutrient?.name === "string" &&
                nutrient.name.toLowerCase() === "protein"
            );
            if (proteinNutrient?.amount) {
              protein = proteinNutrient.amount;
            }

            const fatNutrient = recipe.nutrition.nutrients.find(
              (nutrient: any) =>
                typeof nutrient?.name === "string" &&
                nutrient.name.toLowerCase() === "fat"
            );
            if (fatNutrient?.amount) {
              fat = fatNutrient.amount;
            }
          }

          // Fallback to summary if calories not found in nutrients
          if (!calories && recipe.summary) {
            const calorieMatch = recipe.summary.match(/(\d+)\s+calories/i);
            if (calorieMatch) {
              calories = parseInt(calorieMatch[1], 10);
            }
          }

          return {
            id: recipe.id,
            title: recipe.title,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            imageType: recipe.imageType,
            image: recipe.image,
            sourceUrl: recipe.sourceUrl,
            nutrition: {
              calories,
              carbs,
              protein,
              fat,
            },
          } as Meal;
        });

        // Assign results to the appropriate meal type
        mealPlan[meal.type].results = processedResults;
        mealPlan[meal.type].totalResults = totalResults;
      }

      console.log("Generated Meal Plan:", JSON.stringify(mealPlan, null, 2));

      return mealPlan;
    } finally {
      setIsGenerating(false);
    }
  }

  return {
    generateMealPlan,
    isGenerating,
  };
}
