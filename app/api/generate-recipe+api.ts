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
        .describe(
          "Unit of measurement. CRITICAL: Use 'ml' for liquids (oil, water, milk, sauce) and 'g' for solids (meat, veg, flour, pasta). For countable items (eggs, fruits), use 'whole' or leave empty. DO NOT use 'cup', 'tbsp', 'tsp' - convert to ml/g."
        ),
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
  goals: z.array(z.string()).default([]),
  cookingSkill: z.string().nullable().optional(),
});

function generateDynamicPrompt(
  validatedData: z.infer<typeof requestSchema>
): string {
  const {
    ingredients,
    mealType,
    cookingTime,
    calorieRange,
    allergies,
    dietPreferences,
    cuisines,
    dislikedCuisines,
    goals,
    cookingSkill,
  } = validatedData;

  const cookingTimeText = COOKING_TIME_MAP[cookingTime] || cookingTime;

  const calorieRangeObj = CALORIE_RANGE_MAP[calorieRange];
  let calorieRangeText = calorieRange;
  if (calorieRangeObj) {
    if (calorieRange === "1000+") calorieRangeText = "at least 1000 calories";
    else if (calorieRange === "flexible")
      calorieRangeText = "flexible (200-800 calories)";
    else
      calorieRangeText = `${calorieRangeObj.min}-${calorieRangeObj.max} calories per serving`;
  }

  const COOKING_SKILL_MAP: Record<string, string> = {
    beginner: "beginner (simple techniques, minimal steps, basic ingredients)",
    basic:
      "basic (comfortable with common techniques, some multi-step processes)",
    intermediate:
      "intermediate (confident with various techniques, can handle complex recipes)",
    advanced:
      "advanced (skilled with professional techniques, enjoys challenging recipes)",
  };
  const cookingSkillText = cookingSkill
    ? COOKING_SKILL_MAP[cookingSkill] || cookingSkill
    : "any level";

  // Dinamik yaratıcılık artırıcıları
  const creativityBoosters = [
    "Focus on uncommon ingredient combinations that work surprisingly well together.",
    "Incorporate a surprising technique or unexpected flavor pairing.",
    "Emphasize seasonal ingredients and freshness in the dish composition.",
    "Create a fusion-style recipe blending unexpected culinary traditions.",
    "Design a recipe with vibrant colors and varied textures for visual appeal.",
    "Use a modern, creative interpretation of a classic dish concept.",
    "Prioritize minimal cleanup while maintaining flavor complexity.",
    "Feature an underutilized ingredient as the star component.",
  ];
  const randomBooster =
    creativityBoosters[Math.floor(Math.random() * creativityBoosters.length)];

  // Farklı prompt açılışları
  const openings = [
    `Create a UNIQUE and INNOVATIVE recipe for ${
      mealType || "a meal"
    } with these specifications:`,
    `Design a CREATIVE ${
      mealType || "dish"
    } that stands out from typical recipes:`,
    `Generate an ORIGINAL recipe concept for ${mealType || "cooking"}:`,
    `Craft a DISTINCTIVE ${
      mealType || "recipe"
    } with the following constraints:`,
    `Develop a NOVEL ${
      mealType || "culinary creation"
    } that breaks from repetition:`,
  ];
  const opening = openings[Math.floor(Math.random() * openings.length)];

  // Hedefe özel varyasyonlar
  const goalSpecificInstructions = goals
    .map((goal) => {
      const variations: Record<string, string[]> = {
        "Eat healthy": [
          "- Prioritize nutritious ingredients, whole foods, and balanced macros.\n- Incorporate colorful vegetables and superfoods for maximum nutrition.",
          "- Focus on high-fiber, nutrient-dense ingredients.\n- Minimize processed components and maximize natural flavors.",
        ],
        "Lose weight": [
          "- Keep calories on the lower end of the specified range.\n- Use lean proteins and minimize added fats and sugars.",
          "- Emphasize high-volume, low-calorie ingredients for satiety without excess calories.",
        ],
        "Build muscle": [
          "- Ensure high protein content (30g+ per serving) with complete proteins.\n- Include ingredients that support muscle recovery and growth.",
          "- Include multiple protein sources and nutrients that aid muscle synthesis.",
        ],
        "Gain weight": [
          "- Include calorie-dense ingredients, healthy fats, and complex carbohydrates.",
          "- Focus on nutrient-rich, energy-dense foods to support healthy weight gain.",
        ],
        "Save time": [
          "- Minimize prep steps and use time-saving cooking techniques.\n- Prioritize one-pot or sheet-pan methods.",
          "- Streamline the process with efficient mise en place and parallel cooking steps.",
        ],
        "Learn to cook": [
          "- Include educational tips within the instructions.\n- Explain cooking techniques and the reasoning behind steps.",
          "- Break down fundamental skills and provide timing guidance for beginners.",
        ],
        "Try new recipes": [
          "- Be highly creative with flavors, ingredients, and combinations.\n- Introduce unexpected but harmonious elements.",
          "- Push culinary boundaries while maintaining balance and accessibility.",
        ],
        "Stick to your diet": [
          "- Strictly adhere to all specified diet preferences without compromise.\n- Double-check every ingredient for compliance.",
          "- Ensure zero deviation from dietary restrictions and preferences.",
        ],
      };
      const varArray = variations[goal];
      if (!varArray) return "";
      return varArray[Math.floor(Math.random() * varArray.length)];
    })
    .filter(Boolean)
    .join("\n\n");

  return `
${opening}

**User Preferences:**
- Ingredients: ${
    ingredients.length > 0 ? ingredients.join(", ") : "Any available"
  }
- Meal Type: ${mealType || "Flexible"}
- Cooking Time: ${cookingTimeText}
- Calories: ${calorieRangeText}
- Allergies: ${allergies.length > 0 ? allergies.join(", ") : "None"}
- Diet: ${dietPreferences.length > 0 ? dietPreferences.join(", ") : "None"}
- Preferred Cuisines: ${cuisines.length > 0 ? cuisines.join(", ") : "Any"}
- Avoid Cuisines: ${
    dislikedCuisines.length > 0 ? dislikedCuisines.join(", ") : "None"
  }
- Goals: ${goals.length > 0 ? goals.join(", ") : "None specified"}
- Cooking Skill: ${cookingSkillText}

---

**CREATIVE REQUIREMENT (CRITICAL):**
${randomBooster}

**GOAL-SPECIFIC GUIDELINES:**
${goalSpecificInstructions}

**RECIPE NAMING RULES (STRICT):**
- Format: [Main Ingredient] + [Style/Method] OR [Ingredient A] + [Ingredient B] + [Dish Type]
- NEVER use: kitchen tools (skillet, pot, pan, bowl, plate), size adjectives (large, medium, small), subjective adjectives (delicious, tasty, savory, hearty, perfect, ultimate, best, quick, easy), cuisine names at start, container words (bowl, plate, dish, pot, casserole)
- Correct Examples: "Garlic Butter Salmon", "Spicy Chicken Pasta", "Beef and Broccoli Stir-Fry"
- CRITICAL: Every recipe name must be UNIQUE and DIFFERENT from previous ones

**NUTRITIONAL REQUIREMENTS:**
- Must include per serving: Calories, Protein, Carbs, Fat, Fiber, Sugar, Sodium
- Use accurate gram/mg values
- Match specified calorie range exactly

**INGREDIENT MEASUREMENTS (CRITICAL):**
- SOLIDS: Always grams (g) - "200g chicken breast"
- LIQUIDS: Milliliters (ml) - "250ml milk"
- EXCEPTIONS: Whole eggs ("2 eggs"), garlic cloves ("3 garlic cloves")
- SPICES: tsp/tbsp acceptable only for <10g amounts
- NEVER: Use cups, tablespoons, teaspoons for main measured items
- CRITICAL: Ensure 'unit' field matches measurement type precisely (g for solids, ml for liquids)

**INSTRUCTIONS:**
- Provide 5-10 clear, numbered steps
- Include temperatures (°C) and cooking times
- Be specific about doneness indicators

**TIME & CALORIES:**
- Total time: ${cookingTimeText}
- Target per serving: ${calorieRangeText}

**ALLERGY & DIET ENFORCEMENT:**
- DOUBLE-CHECK all ingredients against allergy list - ZERO exceptions
- VERIFY strict compliance with all diet preferences
- ABSOLUTELY NO PORK or pork-derived products under any circumstances
- Review each ingredient for potential hidden allergens

**REPETITION WARNING:**
This recipe MUST be completely different from previous generations. Do not reuse the same main proteins, cooking methods, or flavor profiles repeatedly. VARIATION is required.
`.trim();
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const validatedData = requestSchema.parse(rawBody);

    const { cookingTime, calorieRange } = validatedData;

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

    const systemPrompt = `You are an expert chef specializing in creating DIVERSE, CREATIVE, and UNIQUE recipes. Your primary mission is to generate COMPLETELY DIFFERENT recipes each time, never falling into repetition patterns.

CORE DIRECTIVES:
1. ALWAYS produce a UNIQUE recipe name following strict naming rules (no tools, adjectives, cuisines)
2. Use EXACT metric units (g for solids, ml for liquids) - NEVER approximations
3. STRICTLY ENFORCE all dietary restrictions and allergy exclusions
4. PRECISELY match the specified calorie range
5. Be CREATIVE and ADVENTUROUS with ingredients, flavors, and techniques
6. ENSURE every recipe is DISTINCT from previous generations - VARIATION is mandatory
7. NO PORK products under any circumstances
8. Double-check every ingredient for compliance

Your goal is SURPRISE and VARIETY, not repetition. Challenge yourself to explore new culinary directions with each generation.`;

    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: recipeSchema,
      temperature: 0.85,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: generateDynamicPrompt(validatedData),
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
