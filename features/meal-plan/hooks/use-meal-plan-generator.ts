import { CUISINES } from "@/lib/constants";
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
      const API_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;

      if (!API_KEY) {
        throw new Error("Spoonacular API key is not configured");
      }

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
        // Build query parameters
        const params = new URLSearchParams({
          apiKey: API_KEY,
          addRecipeInformation: "true",
          addRecipeNutrition: "true",
          number: "12",
        });

        if (includedCuisines.length > 0) {
          params.append("cuisine", includedCuisines.join(","));
        }

        if (excludedIngredients.length > 0) {
          params.append("excludeIngredients", excludedIngredients.join(","));
        }

        if (meal.type) {
          params.append("type", meal.type);
        }

        if (meal.includedIngredients.length > 0) {
          params.append(
            "includeIngredients",
            meal.includedIngredients.join(",")
          );
        }

        const response = await fetch(
          `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Spoonacular API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Check if results exist and is an array
        if (!Array.isArray(data.results)) {
          console.error("Invalid API response:", data);
          throw new Error(
            data.message || "Invalid response from Spoonacular API"
          );
        }

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
