import { pantryService } from "@/features/pantry/services/pantry-service";
import {
  Recipe,
  searchRecipes,
  searchRecipesByIngredients,
} from "@/lib/spoonacular";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  const {
    messages,
    userId,
  }: { messages: UIMessage[]; userId: string | undefined } = await req.json();

  if (!userId) {
    return new Response("Unauthorized: Missing userId", { status: 401 });
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are a helpful meal planning assistant. Create 1-day meal plans with breakfast, lunch, and dinner.

CRITICAL RULES:
1. After calling searchRecipes or searchRecipesWithPantryItems, NEVER repeat, list, or summarize the recipe results - the UI displays them as cards automatically
2. After showing recipes, you MUST call askForMealPlanConfirmation tool to ask if user wants a meal plan
3. WAIT for user confirmation before creating any meal plans
4. Only create meal plans AFTER user confirms through the askForMealPlanConfirmation tool
5. Keep all responses concise and conversational

TOOL USAGE PRIORITY:
1. IF user mentions "ingredients", "pantry", "what can I make", "cook with what I have" -> YOU MUST USE searchRecipesWithPantryItems
2. Do NOT call getPantryItems separately before searchRecipesWithPantryItems (it does it internally)
3. Use searchRecipes ONLY for specific food requests (e.g. "I want pasta", "Show me burger recipes")
4. Use getPantryItems ONLY if user specifically asks "What do I have?" or "Check my pantry"

WORKFLOWS:
- User: "What can I make with my ingredients?"
  -> AI: call searchRecipesWithPantryItems -> show cards -> call askForMealPlanConfirmation

- User: "I want tacos"
  -> AI: call searchRecipes(query="tacos") -> show cards -> call askForMealPlanConfirmation

- User: "Do I have tomatoes?"
  -> AI: call getPantryItems -> answer yes/no

WRONG: calling getPantryItems then searchRecipes (inefficient)
RIGHT: calling searchRecipesWithPantryItems (efficient, does both)
`,
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
          console.log("Tool called: searchRecipes");
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
            readyInMinutes: recipe.readyInMinutes,
            nutrition: recipe.nutrition,
          }));

          console.log("=== SEARCH RECIPES TOOL RESULT ===");
          console.log(JSON.stringify(simplifiedRecipes, null, 2));
          return simplifiedRecipes;
        },
      },
      // Server-side tool to get user's pantry items
      getPantryItems: {
        description:
          "Get the list of ingredients currently in the user's pantry. Use this to suggest recipes based on what they already have.",
        inputSchema: z.object({}),
        execute: async () => {
          console.log("Tool called: getPantryItems");
          try {
            const items = await pantryService.getItemsForUser(userId, "pantry");
            // Return simplified data - just ingredient names
            const ingredientNames = items.map((item) => item.name);
            console.log("=== PANTRY ITEMS ===");
            console.log(ingredientNames);
            return {
              count: ingredientNames.length,
              ingredients: ingredientNames,
            };
          } catch (error) {
            console.error("Failed to get pantry items:", error);
            return {
              count: 0,
              ingredients: [],
              error: "Could not fetch pantry items",
            };
          }
        },
      },
      // Search recipes using pantry items automatically
      searchRecipesWithPantryItems: {
        description:
          "Find recipes that can be made with ingredients currently in the user's pantry. Automatically fetches pantry items and searches for recipes sorted by minimum missing ingredients.",
        inputSchema: z.object({
          number: z.number().default(3).describe("Number of recipes to return"),
        }),
        execute: async ({ number }) => {
          console.log("Tool called: searchRecipesWithPantryItems");
          try {
            // 1. Get pantry items using server-side method
            const items = await pantryService.getItemsForUser(userId, "pantry");
            if (!items || items.length === 0) {
              return {
                error: "No items found in pantry. Cannot search for recipes.",
                recipes: [],
              };
            }

            // 2. Extract names and join
            const ingredients = items.map((item) => item.name).join(",");
            console.log(
              "Searching recipes with pantry ingredients:",
              ingredients
            );

            // 3. Search recipes
            const result = await searchRecipesByIngredients(
              ingredients,
              number,
              true // ignorePantry staples like salt/water
            );

            // 4. Simplify results
            const simplifiedRecipes = result.results.map((recipe: any) => ({
              id: recipe.id,
              title: recipe.title,
              image: recipe.image,
              usedIngredientCount: recipe.usedIngredientCount,
              missedIngredientCount: recipe.missedIngredientCount,
              missedIngredients: recipe.missedIngredients.map(
                (i: any) => i.name
              ),
              usedIngredients: recipe.usedIngredients.map((i: any) => i.name),
            }));

            console.log(
              "=== RECIPES BY INGREDIENTS RESULT ===",
              JSON.stringify(simplifiedRecipes, null, 2)
            );
            return simplifiedRecipes;
          } catch (error) {
            console.error("Failed to search recipes with pantry items:", error);
            return { error: "Failed to search recipes" };
          }
        },
      },
      // Client-side tool that asks user for confirmation before creating meal plan
      askForMealPlanConfirmation: {
        description: "Ask the user if they want to create a meal plan",
        inputSchema: z.object({
          message: z
            .string()
            .describe(
              "The confirmation message to show the user (e.g., 'Would you like me to create a meal plan?')"
            ),
        }),
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
