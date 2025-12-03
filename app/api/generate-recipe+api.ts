import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

// Cooking time mapping for prompt
const COOKING_TIME_MAP: Record<string, string> = {
  "<15": "under 15 minutes",
  "<30": "15-30 minutes",
  "<45": "30-45 minutes",
  "<60": "45-60 minutes",
  ">60": "over 60 minutes",
};

// Calorie range mapping for prompt
const CALORIE_RANGE_MAP: Record<string, { min: number; max: number }> = {
  "<200": { min: 100, max: 200 },
  "<400": { min: 200, max: 400 },
  "<600": { min: 400, max: 600 },
  ">600": { min: 600, max: 900 },
};

// Recipe schema for AI generation
const recipeSchema = z.object({
  title: z.string().describe("A creative and appetizing name for the recipe"),
  summary: z.string().describe("A brief 2-3 sentence description of the dish"),
  readyInMinutes: z
    .number()
    .describe("Total preparation and cooking time in minutes"),
  servings: z.number().describe("Number of servings this recipe makes"),
  cuisines: z
    .array(z.string())
    .describe("Cuisine types this recipe belongs to"),
  dishTypes: z
    .array(z.string())
    .describe("Dish types like main course, side dish, dessert"),
  diets: z
    .array(z.string())
    .describe(
      "Applicable diets like vegetarian, vegan, gluten-free, dairy-free"
    ),
  nutrition: z.object({
    nutrients: z.array(
      z.object({
        name: z.string().describe("Nutrient name"),
        amount: z.number().describe("Amount of the nutrient"),
        unit: z.string().describe("Unit of measurement"),
      })
    ),
  }),
  extendedIngredients: z.array(
    z.object({
      id: z.number().describe("Unique ingredient ID"),
      name: z.string().describe("Ingredient name"),
      amount: z.number().describe("Amount needed"),
      unit: z.string().describe("Unit of measurement"),
      original: z
        .string()
        .describe("Original ingredient description as written in recipe"),
    })
  ),
  instructions: z
    .array(
      z.object({
        number: z.number().describe("Step number starting from 1"),
        step: z.string().describe("Detailed step instruction"),
      })
    )
    .describe("Array of cooking instruction steps"),
});

export async function POST(req: Request) {
  try {
    const {
      ingredients,
      mealType,
      cookingTime,
      calorieRange,
      allergies,
      dietPreferences,
      cuisines,
      dislikedCuisines,
    } = await req.json();

    // Get readable cooking time and calorie range
    const cookingTimeText = COOKING_TIME_MAP[cookingTime] || "any duration";
    const calorieRangeObj = CALORIE_RANGE_MAP[calorieRange] || {
      min: 200,
      max: 600,
    };

    const prompt = `
Create a complete, detailed recipe based on the following preferences:

**Available Ingredients (prioritize using these):**
${ingredients?.length > 0 ? ingredients.join(", ") : "Any common ingredients"}

**Meal Type:** ${mealType || "any meal"}

**Cooking Time:** ${cookingTimeText}

**Calorie Target:** ${calorieRangeObj.min}-${
      calorieRangeObj.max
    } calories per serving

**Allergies/Intolerances (MUST AVOID):**
${allergies?.length > 0 ? allergies.join(", ") : "None specified"}

**Diet Preferences:**
${dietPreferences?.length > 0 ? dietPreferences.join(", ") : "None specified"}

**Preferred Cuisines:**
${cuisines?.length > 0 ? cuisines.join(", ") : "Any cuisine"}

**Cuisines to Avoid:**
${dislikedCuisines?.length > 0 ? dislikedCuisines.join(", ") : "None"}

Requirements:
1. Create a realistic, cookable recipe that respects ALL dietary restrictions and allergies
2. Use the available ingredients when possible, but add necessary staples
3. Keep cooking time within the specified range
4. Ensure calories per serving fall within ${calorieRangeObj.min}-${
      calorieRangeObj.max
    } kcal
5. Include accurate nutritional information with at least: Calories, Protein, Carbohydrates, Fat, Fiber, Sugar, Sodium
6. Provide clear, numbered cooking instructions (5-10 steps)
7. List all ingredients with precise measurements
8. Make it delicious and practical for home cooking

Generate a unique recipe ID between 900000 and 999999 (to distinguish from real recipe IDs).
`;

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: recipeSchema,
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `You are a professional chef and nutritionist who creates delicious, healthy recipes. 
You always provide accurate nutritional information and clear cooking instructions.
You are creative but practical - recipes should be achievable for home cooks.
Never include ingredients that conflict with stated allergies or dietary restrictions.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Generate a unique AI recipe ID (900000-999999 range)
    const aiRecipeId = Math.floor(Math.random() * 100000) + 900000;

    // Construct the final recipe object matching the Recipe interface
    const recipe = {
      id: aiRecipeId,
      title: result.object.title,
      image: "", // Will use placeholder in UI
      summary: result.object.summary,
      cuisines: result.object.cuisines,
      dishTypes: result.object.dishTypes,
      diets: result.object.diets,
      readyInMinutes: result.object.readyInMinutes,
      servings: result.object.servings,
      nutrition: result.object.nutrition,
      extendedIngredients: result.object.extendedIngredients,
      // Convert flat instructions array to analyzedInstructions format
      analyzedInstructions: [
        {
          name: "",
          steps: result.object.instructions,
        },
      ],
      isAiGenerated: true,
    };

    return new Response(JSON.stringify(recipe), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating recipe:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate recipe",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
