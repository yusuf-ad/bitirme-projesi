import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const ALL_MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
type MealType = (typeof ALL_MEAL_TYPES)[number];

const FALLBACK_QUERIES: Record<MealType, string> = {
  breakfast: "high protein breakfast bowl",
  lunch: "balanced lunch bowl",
  dinner: "nutritious dinner plate",
};

export async function POST(req: Request) {
  try {
    const {
      goals,
      allergies,
      cuisines,
      dislikedCuisines,
      dietPreferences,
      mealTypes,
    } = await req.json();

    const requestedMealTypes = (
      Array.isArray(mealTypes) ? mealTypes : ALL_MEAL_TYPES
    ).filter((type): type is MealType =>
      ALL_MEAL_TYPES.includes(type as MealType)
    );

    const normalizedMealTypes =
      requestedMealTypes.length > 0 ? requestedMealTypes : ALL_MEAL_TYPES;

    const schema = z.object({
      breakfast: z
        .array(z.string())
        .describe("List of 3 distinct breakfast meal queries")
        .optional(),
      lunch: z
        .array(z.string())
        .describe("List of 3 distinct lunch meal queries")
        .optional(),
      dinner: z
        .array(z.string())
        .describe("List of 3 distinct dinner meal queries")
        .optional(),
    });

    const prompt = `
      Generate specific meal search queries for Spoonacular API based on the following user preferences:
      
      Goals: ${goals?.join(", ") || "Healthy eating"}
      Allergies (Avoid): ${allergies?.join(", ") || "None"}
      Preferred Cuisines: ${cuisines?.join(", ") || "Any"}
      Disliked Cuisines: ${dislikedCuisines?.join(", ") || "None"}
      Diet Preferences: ${dietPreferences?.join(", ") || "None"}
      
      For each selected meal type (${normalizedMealTypes.join(
        ", "
      )}), provide 3 distinct simple search queries (e.g., "Chicken Salad", "Oatmeal", "Pasta").
      Avoid overly complex names like "Zucchini Noodles with Pesto" unless necessary. Prefer "Zucchini Noodles" or "Pesto Pasta".
      The query should be broad enough to ensure results in a recipe database.
      Do not include the words "breakfast", "lunch", or "dinner" in the query itself unless it's part of the dish name.
      Focus on the user's goals and preferences.

      IMPORTANT: Be creative and varied. Do not suggest the same meals every time.
      Ensure the 3 queries for each meal type are different from each other.
      Random Seed: ${Math.random()}
    `;

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema,
      temperature: 1.0,
      messages: [
        {
          role: "system",
          content: "You are a nutritionist and meal planner assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const ideas: Record<MealType, string[]> = {} as Record<MealType, string[]>;

    normalizedMealTypes.forEach((type) => {
      const suggestions = result.object?.[type];
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        ideas[type] = suggestions.filter(
          (s) => typeof s === "string" && s.trim().length > 0
        );
      } else {
        ideas[type] = [FALLBACK_QUERIES[type]];
      }
    });

    return new Response(JSON.stringify(ideas), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating meal ideas:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate meal ideas" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
