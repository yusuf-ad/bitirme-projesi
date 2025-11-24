import { pantryService } from "@/features/pantry/services/pantry-service";
import type { RandomRecipesFilters } from "@/lib/spoonacular";
import {
  getRandomRecipes,
  Recipe,
  searchRecipes,
  searchRecipesByIngredients,
} from "@/lib/spoonacular";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { z } from "zod";

type UserGoalsRow = {
  goal_ids: string[] | null;
};

type UserBodyMetricsRow = {
  gender: "male" | "female" | "prefer-not-to-say" | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
};

type UserMealTimesRow = {
  breakfast_time: string | null;
  lunch_time: string | null;
  dinner_time: string | null;
};

type UserTastePreferencesRow = {
  meal_types: string[] | null;
  cuisines: string[] | null;
  cuisine_dislikes: string[] | null;
  allergies_dislikes: string[] | null;
  diet_preferences: string[] | null;
  cooking_skill_level: "novice" | "basic" | "intermediate" | "advanced" | null;
  diet_nutrition_targets: Record<string, unknown> | null;
};

type UserOnboardingProfile = {
  goals: UserGoalsRow | null;
  bodyMetrics: UserBodyMetricsRow | null;
  mealTimes: UserMealTimesRow | null;
  tastePreferences: UserTastePreferencesRow | null;
};

type MealPeriod = "AM" | "PM";

type MealTimePreference = {
  hour: number;
  minute: number;
  period: MealPeriod;
};

type MealTimesSchedule = {
  breakfast: MealTimePreference;
  lunch: MealTimePreference;
  dinner: MealTimePreference;
};

type MealSlot = "breakfast" | "lunch" | "dinner";

export async function POST(req: Request) {
  const {
    messages,
    userId,
    accessToken,
  }: {
    messages: UIMessage[];
    userId: string | undefined;
    accessToken: string | undefined;
  } = await req.json();

  if (!userId) {
    return new Response("Unauthorized: Missing userId", { status: 401 });
  }

  if (!accessToken) {
    return new Response("Unauthorized: Missing access token", { status: 401 });
  }

  // Create authenticated Supabase client for this request
  const supabaseAuth = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  const DEFAULT_MEAL_TIMES: MealTimesSchedule = {
    breakfast: { hour: 8, minute: 0, period: "AM" },
    lunch: { hour: 1, minute: 0, period: "PM" },
    dinner: { hour: 7, minute: 0, period: "PM" },
  };

  const parseTimeString = (
    value: string | null | undefined,
    fallback: MealTimePreference
  ): MealTimePreference => {
    if (!value) {
      return fallback;
    }

    const [rawHour, rawMinute] = value
      .split(":")
      .map((segment) => Number(segment));
    if (Number.isNaN(rawHour) || Number.isNaN(rawMinute)) {
      return fallback;
    }

    const period: MealPeriod = rawHour >= 12 ? "PM" : "AM";
    const normalizedHour = rawHour % 12 === 0 ? 12 : rawHour % 12;
    return {
      hour: normalizedHour,
      minute: rawMinute,
      period,
    };
  };

  const toMinutesFromMidnight = (time: MealTimePreference): number => {
    let hour24 = time.hour % 12;
    if (time.period === "PM") {
      hour24 += 12;
    } else if (time.period === "AM" && time.hour === 12) {
      hour24 = 0;
    }
    return hour24 * 60 + time.minute;
  };

  const buildMealSchedule = (mealTimes: UserMealTimesRow | null) => {
    const schedule: MealTimesSchedule = {
      breakfast: parseTimeString(
        mealTimes?.breakfast_time,
        DEFAULT_MEAL_TIMES.breakfast
      ),
      lunch: parseTimeString(mealTimes?.lunch_time, DEFAULT_MEAL_TIMES.lunch),
      dinner: parseTimeString(
        mealTimes?.dinner_time,
        DEFAULT_MEAL_TIMES.dinner
      ),
    };

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const breakfastWindow = toMinutesFromMidnight(schedule.breakfast) + 90;
    const lunchWindow = toMinutesFromMidnight(schedule.lunch) + 120;
    const dinnerWindow = toMinutesFromMidnight(schedule.dinner) + 180;

    let activeMealSlot: MealSlot = "dinner";
    if (nowMinutes <= breakfastWindow) {
      activeMealSlot = "breakfast";
    } else if (nowMinutes <= lunchWindow) {
      activeMealSlot = "lunch";
    } else if (nowMinutes <= dinnerWindow) {
      activeMealSlot = "dinner";
    }

    return { schedule, activeMealSlot };
  };

  const fetchSingleRow = async <T>(table: string): Promise<T | null> => {
    const { data, error } = await supabaseAuth
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && (error as any).code !== "PGRST116") {
      console.error(`Failed to fetch ${table}:`, error);
    }

    return (data as T) ?? null;
  };

  const fetchUserOnboardingProfile =
    async (): Promise<UserOnboardingProfile> => {
      const [goals, bodyMetrics, mealTimes, tastePreferences] =
        await Promise.all([
          fetchSingleRow<UserGoalsRow>("user_goals"),
          fetchSingleRow<UserBodyMetricsRow>("user_body_metrics"),
          fetchSingleRow<UserMealTimesRow>("user_meal_times"),
          fetchSingleRow<UserTastePreferencesRow>("user_taste_preferences"),
        ]);

      return {
        goals,
        bodyMetrics,
        mealTimes,
        tastePreferences,
      };
    };

  let cachedProfile: UserOnboardingProfile | null = null;
  const getCachedProfile = async () => {
    if (cachedProfile) {
      return cachedProfile;
    }
    cachedProfile = await fetchUserOnboardingProfile();
    return cachedProfile;
  };

  const simplifyRecipes = (recipes: Recipe[]) =>
    recipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      summary: recipe.summary,
      cuisines: recipe.cuisines || [],
      readyInMinutes: recipe.readyInMinutes,
      nutrition: recipe.nutrition,
      diets: recipe.diets || [],
    }));

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are a helpful meal planning assistant. Create 1-day meal plans with breakfast, lunch, and dinner.

CRITICAL RULES:
1. Always call getUserPreferences at the start of the conversation (only once) before suggesting recipes or meal plans so you know diets, allergies, cuisines, cooking skill, goals, and meal schedule.
2. After calling searchRecipes, searchPersonalizedRecipes, or searchRecipesWithPantryItems, NEVER repeat, list, or summarize the recipe results - the UI already renders the cards.
3. After showing recipes, you MUST call askForMealPlanConfirmation to ask if the user wants a meal plan, and WAIT for their confirmation before creating or modifying plans.
4. Only create meal plans AFTER the user confirms via askForMealPlanConfirmation.
5. Keep all responses concise, friendly, and reference the meal slot you are targeting (e.g., “Here are some dinner ideas”).

PERSONALIZATION WORKFLOW:
- Use searchPersonalizedRecipes for general inspiration, meal planning, or when the user doesn’t name a specific dish. It automatically honors diet, allergy, cuisine, cooking skill, meal times, and goals.
- If the user requests a specific dish or cuisine (“Show me tacos”), call searchRecipes with that query AND manually enforce any allergies or diet restrictions you learned from getUserPreferences.
- If the user asks what they can cook with existing ingredients (“What can I cook with my pantry?”), use searchRecipesWithPantryItems. Do NOT call getPantryItems separately beforehand.
- Only call getPantryItems when the user explicitly asks to review pantry contents (“Do I have tomatoes?”).
- Mention when suggestions align with their schedule (e.g., breakfast vs dinner) using the activeMealSlot from getUserPreferences.

WORKFLOWS:
- User: “What should I eat today?”
  -> AI: ensure getUserPreferences is already called -> call searchPersonalizedRecipes (number=3) -> show cards -> call askForMealPlanConfirmation

- User: “Show me taco recipes.”
  -> AI: use searchRecipes(query="tacos", type based on meal slot) while excluding allergies -> show cards -> call askForMealPlanConfirmation

- User: “What can I make with my ingredients?”
  -> AI: call searchRecipesWithPantryItems -> show cards -> call askForMealPlanConfirmation

- User: “Do I have tomatoes?”
  -> AI: call getPantryItems -> answer yes/no

WRONG: calling getPantryItems before searchRecipesWithPantryItems (redundant)
RIGHT: using searchPersonalizedRecipes first so every suggestion respects the profile
`,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      getUserPreferences: {
        description:
          "Fetches the user's onboarding profile including diet preferences, allergies, cuisines, goals, body metrics, and preferred meal times.",
        inputSchema: z.object({}),
        execute: async () => {
          console.log("Tool called: getUserPreferences");
          try {
            const profile = await getCachedProfile();
            const { schedule, activeMealSlot } = buildMealSchedule(
              profile.mealTimes
            );

            return {
              goals: profile.goals?.goal_ids ?? [],
              bodyMetrics: {
                gender: profile.bodyMetrics?.gender ?? null,
                age: profile.bodyMetrics?.age ?? null,
                heightCm: profile.bodyMetrics?.height_cm ?? null,
                weightKg: profile.bodyMetrics?.weight_kg ?? null,
              },
              preferences: {
                mealTypes: profile.tastePreferences?.meal_types ?? [],
                cuisines: profile.tastePreferences?.cuisines ?? [],
                dislikedCuisines:
                  profile.tastePreferences?.cuisine_dislikes ?? [],
                allergies: profile.tastePreferences?.allergies_dislikes ?? [],
                dietPreferences:
                  profile.tastePreferences?.diet_preferences ?? [],
                cookingSkill:
                  profile.tastePreferences?.cooking_skill_level ?? null,
                dietNutritionTargets:
                  profile.tastePreferences?.diet_nutrition_targets ?? {},
              },
              mealTimes: schedule,
              activeMealSlot,
            };
          } catch (error) {
            console.error("Failed to fetch user preferences:", error);
            return { error: "Could not load user preferences" };
          }
        },
      },
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
            const items = await pantryService.getItemsForUser(
              userId,
              "pantry",
              supabaseAuth
            );

            console.log(items, userId);

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
            // 1. Get pantry items using server-side method with authenticated client
            const items = await pantryService.getItemsForUser(
              userId,
              "pantry",
              supabaseAuth
            );
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
      searchPersonalizedRecipes: {
        description:
          "Find recipes that automatically account for the user's diet, allergies, cuisines, cooking skill, and preferred meal times.",
        inputSchema: z.object({
          query: z
            .string()
            .optional()
            .describe("Optional text query to steer the recipe theme."),
          mealType: z
            .enum(["breakfast", "lunch", "dinner", "snack"])
            .optional()
            .describe(
              "Meal slot to target. Defaults to the user's current meal window."
            ),
          number: z
            .number()
            .default(3)
            .describe("Number of personalized recipes to return."),
          usePantryItems: z
            .boolean()
            .default(false)
            .describe(
              "If true, include pantry items as required ingredients where possible."
            ),
        }),
        execute: async ({ query, mealType, number, usePantryItems }) => {
          console.log("Tool called: searchPersonalizedRecipes");
          try {
            const profile = await getCachedProfile();
            const { schedule, activeMealSlot } = buildMealSchedule(
              profile.mealTimes
            );

            const taste = profile.tastePreferences;
            const resolvedMealType = mealType ?? activeMealSlot;

            const filters: RandomRecipesFilters = {
              type: resolvedMealType,
            };

            if (taste?.diet_preferences?.length) {
              filters.diet = taste.diet_preferences[0];
            }

            if (taste?.cuisines?.length) {
              filters.cuisine = taste.cuisines.join(",");
            }

            if (taste?.allergies_dislikes?.length) {
              filters.excludeIngredients = taste.allergies_dislikes.join(",");
            }

            const cookingSkill = taste?.cooking_skill_level;
            if (cookingSkill === "novice") {
              filters.maxReadyTime = 30;
            } else if (cookingSkill === "basic") {
              filters.maxReadyTime = 45;
            }

            if (usePantryItems) {
              const pantryItems = await pantryService.getItemsForUser(
                userId,
                "pantry",
                supabaseAuth
              );
              if (pantryItems.length > 0) {
                filters.includeIngredients = pantryItems
                  .map((item) => item.name)
                  .join(",");
              }
            }

            let recipes: Recipe[] = [];
            if (query) {
              const response = await searchRecipes(query, 0, number, filters);
              recipes = response.recipes;
            } else {
              const response = await getRandomRecipes(number, filters);
              recipes = response;
            }

            const disliked = (taste?.cuisine_dislikes || []).map((cuisine) =>
              cuisine.toLowerCase()
            );
            const filteredRecipes = recipes.filter((recipe) => {
              if (!disliked.length || !recipe.cuisines?.length) {
                return true;
              }
              return recipe.cuisines.every(
                (cuisine) => !disliked.includes(cuisine.toLowerCase())
              );
            });

            const simplifiedRecipes = simplifyRecipes(filteredRecipes).slice(
              0,
              number
            );

            return {
              recipes: simplifiedRecipes,
              context: {
                appliedMealType: resolvedMealType,
                requestedMealType: mealType || null,
                activeMealSlot,
                cookingSkill,
                diet: filters.diet || null,
                cuisinePreferences: taste?.cuisines || [],
                allergies: taste?.allergies_dislikes || [],
                usingPantryItems: Boolean(filters.includeIngredients),
                mealTimes: schedule,
              },
            };
          } catch (error) {
            console.error("Failed to search personalized recipes:", error);
            return { error: "Could not generate personalized recipes" };
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
