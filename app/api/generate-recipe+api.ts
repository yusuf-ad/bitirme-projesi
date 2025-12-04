import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

// Cooking time mapping for prompt - matches frontend options
const COOKING_TIME_MAP: Record<string, string> = {
  "<15": "under 15 minutes",
  "15-29": "15-29 minutes",
  "30-60": "30-60 minutes",
  open: "any duration",
};

// Calorie range mapping for prompt - matches frontend options
const CALORIE_RANGE_MAP: Record<string, { min: number; max: number }> = {
  "<200": { min: 100, max: 200 },
  "200-399": { min: 200, max: 399 },
  "400-599": { min: 400, max: 599 },
  "600-1000": { min: 600, max: 1000 },
  "1000+": { min: 1000, max: 1500 },
  flexible: { min: 200, max: 800 },
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
      amount: z.number().describe("Amount needed in grams or milliliters"),
      unit: z
        .string()
        .describe(
          "Unit of measurement - use 'g' for solids, 'ml' for liquids, 'pieces' only for whole items like eggs"
        ),
      original: z
        .string()
        .describe(
          "Original ingredient description with precise metric measurements (e.g., '200g chicken breast' not '2 large chicken breasts')"
        ),
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

// Request validation schema
const requestSchema = z.object({
  ingredients: z.array(z.string()).default([]),
  mealType: z.string().optional(),
  cookingTime: z.string(),
  calorieRange: z.string(),
  allergies: z.array(z.string()).default([]),
  dietPreferences: z.array(z.string()).default([]),
  cuisines: z.array(z.string()).default([]),
  dislikedCuisines: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const rawBody = await req.json();
    const validatedData = requestSchema.parse(rawBody);

    const {
      ingredients,
      mealType,
      cookingTime,
      calorieRange,
      allergies,
      dietPreferences,
      cuisines,
      dislikedCuisines,
    } = validatedData;

    console.log("Generating recipe with preferences:", {
      ingredients,
      mealType,
      cookingTime,
      calorieRange,
      allergies,
      dietPreferences,
      cuisines,
      dislikedCuisines,
      timestamp: new Date().toISOString(),
    });

    // Get readable cooking time and calorie range with validation
    const cookingTimeText = COOKING_TIME_MAP[cookingTime];
    if (!cookingTimeText) {
      throw new Error(
        `Invalid cooking time option: ${cookingTime}. Valid options are: ${Object.keys(
          COOKING_TIME_MAP
        ).join(", ")}`
      );
    }

    const calorieRangeObj = CALORIE_RANGE_MAP[calorieRange];
    if (!calorieRangeObj) {
      throw new Error(
        `Invalid calorie range option: ${calorieRange}. Valid options are: ${Object.keys(
          CALORIE_RANGE_MAP
        ).join(", ")}`
      );
    }

    // Helper function to format calorie range for prompt
    function formatCalorieRange(
      range: string,
      obj: { min: number; max: number }
    ): string {
      if (range === "1000+") return "at least 1000 calories";
      if (range === "flexible")
        return "flexible calorie range (200-800 calories)";
      return `${obj.min}-${obj.max} calories`;
    }

    const calorieRangeText = formatCalorieRange(calorieRange, calorieRangeObj);

    const prompt = `
Create a complete, detailed recipe based on the following preferences:

**Available Ingredients (prioritize using these):**
${ingredients.length > 0 ? ingredients.join(", ") : "Any common ingredients"}

**Meal Type:** ${mealType || "any meal"}

**Cooking Time:** ${cookingTimeText}

**Calorie Target:** ${calorieRangeText} per serving

**Allergies/Intolerances (MUST AVOID):**
${allergies.length > 0 ? allergies.join(", ") : "None specified"}

**Diet Preferences:**
${dietPreferences.length > 0 ? dietPreferences.join(", ") : "None specified"}

**Preferred Cuisines:**
${cuisines.length > 0 ? cuisines.join(", ") : "Any cuisine"}

**Cuisines to AVOID (DO NOT use these cuisine styles):**
${dislikedCuisines.length > 0 ? dislikedCuisines.join(", ") : "None"}

Requirements:
1. Create a realistic, cookable recipe that respects ALL dietary restrictions and allergies
2. Use the available ingredients when possible, but add necessary staples
3. Keep cooking time within the specified range
4. Ensure calories per serving ${
      calorieRange === "1000+"
        ? "are at least 1000 kcal"
        : calorieRange === "flexible"
        ? "are within a flexible range (200-800 kcal)"
        : `fall within ${calorieRangeObj.min}-${calorieRangeObj.max} kcal`
    }
5. Include accurate nutritional information with at least: Calories, Protein, Carbohydrates, Fat, Fiber, Sugar, Sodium
6. Provide clear, numbered cooking instructions (5-10 steps)
7. INGREDIENT MEASUREMENTS (VERY IMPORTANT):
   - ALWAYS use metric units: grams (g) for solids, milliliters (ml) for liquids
   - NEVER use vague terms like "large", "medium", "small", "a bunch", "a handful"
   - NEVER use "cups" or "tablespoons" for main ingredients - convert to grams
   - Examples of CORRECT measurements: "200g chicken breast", "150g onion", "250ml milk", "30g butter"
   - Examples of INCORRECT measurements: "2 large chicken breasts", "1 medium onion", "1 cup milk"
   - EXCEPTION: Use "pieces" only for whole countable items like eggs (e.g., "2 eggs"), garlic cloves (e.g., "4 garlic cloves")
   - For spices and small amounts, you may use teaspoons (tsp) or tablespoons (tbsp)
8. Make it delicious and practical for home cooking
9. RECIPE NAMING RULES (VERY IMPORTANT):
   - DO NOT start with adjectives like "Savory", "Delicious", "Hearty", "Classic", "Homestyle", "Quick", "Easy", "Simple", "Perfect", "Ultimate", "Best"
   - DO NOT start with cuisine names like "Mediterranean", "Asian", "Italian", "Mexican"
   - START directly with the main ingredient or cooking method
   - Good examples: "Tomato Butter Eggs", "Garlic Herb Chicken", "Beef Stir-Fry", "Lemon Pasta", "Mushroom Risotto"
   - Bad examples: "Savory Tomato Bowl", "Delicious Chicken Dish", "Hearty Beef Stew", "Classic Italian Pasta"
10. If preferred cuisines are specified, incorporate those flavors. If cuisines to avoid are specified, DO NOT use any ingredients or techniques from those cuisines.

IMPORTANT: The recipe name MUST start with a NOUN (ingredient, food item) or a cooking verb (Grilled, Roasted, Pan-Fried), NEVER with a descriptive adjective.
Random seed for variety: ${Math.random().toString(36).substring(7)}
`;

    const result = await generateObject({
      model: openai("gpt-4o"),
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
    // Enhanced error logging
    console.error("AI Recipe Generation Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(7),
    });

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle other errors
    return new Response(
      JSON.stringify({
        error: "Failed to generate recipe",
        details: error instanceof Error ? error.message : "Unknown error",
        requestId: Math.random().toString(36).substring(7),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
