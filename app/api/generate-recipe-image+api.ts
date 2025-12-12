import { supabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();

const requestSchema = z.object({
  recipeId: z.number(),
  title: z.string(),
  summary: z.string().optional(),
  ingredients: z.array(z.string()).default([]),
  userId: z.string().optional(),
});

/**
 * Generate a food photography prompt from recipe details
 */
function generateImagePrompt(
  title: string,
  summary?: string,
  ingredients?: string[]
): string {
  const ingredientList =
    ingredients && ingredients.length > 0
      ? ingredients.slice(0, 6).join(", ")
      : "";

  const cleanSummary = summary
    ? summary.replace(/<[^>]*>/g, "").slice(0, 150)
    : "";

  let prompt = `Professional food photography of ${title}.`;

  if (cleanSummary) {
    prompt += ` ${cleanSummary}`;
  }

  if (ingredientList) {
    prompt += ` Main ingredients: ${ingredientList}.`;
  }

  prompt +=
    " Appetizing presentation, natural lighting, shallow depth of field, restaurant quality, top-down or 45-degree angle view.";

  return prompt;
}

/**
 * Update the AI recipe image URL in the database
 */
async function updateRecipeImageUrl(
  recipeId: number,
  imageUrl: string,
  userId?: string
): Promise<void> {
  try {
    // Update ai_generated_recipes table
    const { error } = await supabaseServer
      .from("ai_generated_recipes")
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq("recipe_id", recipeId);

    if (error) {
      console.error("Error updating recipe image URL:", error);
    }

    // Also update meal_plan_items if they exist for this recipe
    const { error: mealPlanError } = await supabaseServer
      .from("meal_plan_items")
      .update({ recipe_image_url: imageUrl })
      .eq("spoonacular_recipe_id", recipeId)
      .eq("is_ai_generated", true);

    if (mealPlanError) {
      console.error("Error updating meal plan item image:", mealPlanError);
    }
  } catch (err) {
    console.error("Failed to update recipe image URL:", err);
  }
}

export async function POST(req: Request) {
  try {
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const rawBody = await req.json();
    const validatedData = requestSchema.parse(rawBody);
    const { recipeId, title, summary, ingredients, userId } = validatedData;

    // Generate the image prompt
    const prompt = generateImagePrompt(title, summary, ingredients);

    // Call OpenAI DALL-E 2 API (cheapest model)
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-2",
          prompt: prompt,
          n: 1,
          size: "512x512", // Good balance of quality and cost ($0.018)
          response_format: "url",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to generate image",
          details: errorText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "No image URL returned from OpenAI" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update the database with the new image URL
    await updateRecipeImageUrl(recipeId, imageUrl, userId);

    return new Response(JSON.stringify({ imageUrl }), {
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
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.error("Error generating recipe image:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate recipe image",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
