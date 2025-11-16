import { Recipe, searchRecipes } from "@/lib/spoonacular";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are a helpful meal planning assistant. Create 1-day meal plans with breakfast, lunch, and dinner. Use the searchRecipes tool to find recipes. Keep responses concise. Call the searchRecipes tool to find recipes for the given meal type.",
    messages: convertToModelMessages(messages),

    tools: {
      searchRecipes: {
        description: "Search for recipes using Spoonacular API",
        stopWhen: stepCountIs(5),
        inputSchema: z.object({
          query: z.string().describe("Recipe search query"),
          type: z
            .enum(["breakfast", "lunch", "dinner"])
            .optional()
            .describe("Meal type filter"),
          number: z.number().default(1).describe("Number of recipes to return"),
        }),
        execute: async ({ query, type, number }) => {
          const result = await searchRecipes(query, 0, number, { type });

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
