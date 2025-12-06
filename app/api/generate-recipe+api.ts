// generate-recipe+api.ts
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const COOKING_TIME_MAP: Record<string, string> = {
  "<15": "under 15 minutes",
  "15-29": "15-29 minutes",
  "30-60": "30-60 minutes",
  open: "any duration",
};

const CALORIE_RANGE_MAP: Record<string, { min: number; max: number }> = {
  "<200": { min: 100, max: 200 },
  "200-399": { min: 200, max: 399 },
  "400-599": { min: 400, max: 599 },
  "600-1000": { min: 600, max: 1000 },
  "1000+": { min: 1000, max: 1500 },
  flexible: { min: 200, max: 800 },
};

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
        .describe("Unit of measurement - use 'g' for solids, 'ml' for liquids"),
      original: z
        .string()
        .describe(
          "Original ingredient description with precise metric measurements. NEVER use size adjectives like 'large', 'medium', 'small'"
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
CREATE A REALISTIC RECIPE - STRICT NAMING & FORMAT RULES

**User Preferences:**
- Ingredients: ${
      ingredients.length > 0 ? ingredients.join(", ") : "Any available"
    }
- Meal Type: ${mealType || "Flexible"}
- Cooking Time: ${cookingTimeText}
- Calories: ${calorieRangeText} per serving
- Allergies: ${allergies.length > 0 ? allergies.join(", ") : "None"}
- Diet: ${dietPreferences.length > 0 ? dietPreferences.join(", ") : "None"}
- Preferred Cuisines: ${cuisines.length > 0 ? cuisines.join(", ") : "Any"}
- Avoid Cuisines: ${
      dislikedCuisines.length > 0 ? dislikedCuisines.join(", ") : "None"
    }

---

RECIPE NAMING - STRICT RULES:
ALLOWED FORMATS:
1. [Main Ingredient] + [Style/Method] → "Chicken Stir-Fry", "Salmon Teriyaki"
2. [Cooking Verb] + [Main Ingredient] → "Grilled Salmon", "Roasted Vegetables"
3. [Ingredient A] + [Ingredient B] + [Dish Type] → "Tomato Basil Pasta"

FORBIDDEN ELEMENTS (NEVER USE):
- Kitchen tools: skillet, pot, pan, bowl, plate, baking dish, crockpot, instant pot, wok, griddle
- Size adjectives: large, medium, small, big, mini, jumbo
- Subjective adjectives: delicious, tasty, savory, hearty, perfect, ultimate, best, quick, easy
- Cuisine names at start: Mediterranean, Italian, Asian, Mexican, Greek
- Container words: bowl, plate, dish, pot, casserole

CORRECT EXAMPLES:
- "Garlic Butter Salmon"
- "Spicy Chicken Pasta"
- "Beef and Broccoli Stir-Fry"
- "Lemon Herb Roasted Potatoes"
- "Creamy Mushroom Risotto"

INCORRECT EXAMPLES (NEVER DO THIS):
- "Savory Tomato Skillet" (adjective + tool)
- "Chicken Bowl" (tool)
- "Hearty Beef Pot" (adjective + tool)

---

NUTRITIONAL REQUIREMENTS:
- Must include per serving: Calories, Protein, Carbs, Fat, Fiber, Sugar, Sodium
- Use accurate gram/mg values
- Match specified calorie range exactly

INGREDIENT MEASUREMENTS:
- SOLIDS: Always grams (g) - "200g chicken breast"
- LIQUIDS: Milliliters (ml) - "250ml milk"
- EXCEPTIONS: Whole eggs ("2 eggs"), garlic cloves ("3 garlic cloves")
- SPICES: tsp/tbsp allowed for <10g amounts
- NEVER: cups, tablespoons for main items, size adjectives

INSTRUCTIONS:
- 5-10 clear, numbered steps
- Include temperatures (°C) and times

TIME & CALORIES:
- Total time: ${cookingTimeText}
- Calories: ${
      calorieRange === "1000+"
        ? "≥1000"
        : calorieRange === "flexible"
        ? "200-800"
        : `${calorieRangeObj.min}-${calorieRangeObj.max}`
    } kcal/serving

ALLERGY & DIET ENFORCEMENT:
- DOUBLE-CHECK all ingredients against allergy list
- VERIFY diet compliance
- NO PORK or pork-derived products

Critical: Violating naming rules will reject the recipe. Use simple, direct names.
`;

    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: recipeSchema,
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: `You are a professional chef creating STRICTLY FORMATTED recipes. You ALWAYS follow naming conventions precisely. You NEVER add kitchen tools, adjectives, or subjective terms to recipe names. You are meticulous about measurements and dietary restrictions.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const aiRecipeId = Math.floor(Math.random() * 100000) + 900000;

    const recipe = {
      id: aiRecipeId,
      title: result.object.title,
      image: "",
      summary: result.object.summary,
      cuisines: result.object.cuisines,
      dishTypes: result.object.dishTypes,
      diets: result.object.diets,
      readyInMinutes: result.object.readyInMinutes,
      servings: result.object.servings,
      nutrition: result.object.nutrition,
      extendedIngredients: result.object.extendedIngredients,
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
