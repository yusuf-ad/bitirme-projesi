import { Recipe, searchRecipes } from "@/lib/spoonacular";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are a helpful meal planning assistant. Create 1-day meal plans with breakfast, lunch, and dinner. Use the searchRecipes tool to find recipes. Keep responses concise. Call the searchRecipes tool to find recipes for the given meal type. You can use the includeIngredients parameter to specify ingredients that should be included in the recipes (comma-separated list). Combine ingredients into a single search query when possible to avoid multiple tool calls.",
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      searchRecipes: {
        description: "Search for recipes using Spoonacular API",
        inputSchema: z.object({
          query: z.string().describe("Recipe search query"),
          type: z
            .enum(["breakfast", "lunch", "dinner"])
            .optional()
            .describe("Meal type filter"),
          number: z.number().default(3).describe("Number of recipes to return"),
          includeIngredients: z
            .string()
            .optional()
            .describe(
              "A comma-separated list of ingredients that should be included in the recipes"
            ),
        }),
        execute: async ({ query, type, number, includeIngredients }) => {
          const result = await searchRecipes(query, 0, number, {
            type,
            includeIngredients,
          });

          // Extract only necessary fields to reduce token usage
          const simplifiedRecipes = result.recipes.map((recipe: Recipe) => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            summary: recipe.summary,
            cuisines: recipe.cuisines || [],
          }));

          console.log(simplifiedRecipes);
          return simplifiedRecipes;
        },
      },
    },
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
