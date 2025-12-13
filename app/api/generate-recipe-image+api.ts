import { supabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
const STORAGE_BUCKET = "ai-recipe-images";

const requestSchema = z.object({
  recipeId: z.number(),
  title: z.string(),
  summary: z.string().optional(),
  ingredients: z.array(z.string()).default([]),
  userId: z.string().optional(),
});

/**
 * Download image from URL and upload to Supabase Storage
 * Returns the permanent Supabase Storage public URL
 */
async function uploadImageToSupabaseStorage(
  openaiImageUrl: string,
  userId: string,
  recipeId: number
): Promise<{ publicUrl: string | null; error: string | null }> {
  try {
    // Download image from OpenAI
    const imageResponse = await fetch(openaiImageUrl);
    if (!imageResponse.ok) {
      return {
        publicUrl: null,
        error: `Failed to download image: ${imageResponse.status}`,
      };
    }

    // Convert to ArrayBuffer for Supabase upload
    const imageBlob = await imageResponse.blob();
    const imageArrayBuffer = await imageBlob.arrayBuffer();

    // Generate unique filename: userId/recipeId-timestamp.png
    const timestamp = Date.now();
    const fileName = `${userId}/${recipeId}-${timestamp}.png`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseServer.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, imageArrayBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return {
        publicUrl: null,
        error: `Storage upload failed: ${uploadError.message}`,
      };
    }

    // Get public URL for the uploaded image
    const {
      data: { publicUrl },
    } = supabaseServer.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);

    console.log("Image uploaded to Supabase Storage:", publicUrl);

    // Clean up old images for this recipe (optional - keep storage clean)
    await cleanupOldRecipeImages(userId, recipeId, fileName);

    return { publicUrl, error: null };
  } catch (err) {
    console.error("Error uploading image to Supabase Storage:", err);
    return {
      publicUrl: null,
      error: err instanceof Error ? err.message : "Unknown upload error",
    };
  }
}

/**
 * Remove old images for a recipe to prevent storage bloat
 */
async function cleanupOldRecipeImages(
  userId: string,
  recipeId: number,
  currentFileName: string
): Promise<void> {
  try {
    // List all files in user's folder
    const { data: files, error } = await supabaseServer.storage
      .from(STORAGE_BUCKET)
      .list(userId, {
        search: `${recipeId}-`,
      });

    if (error || !files) return;

    // Filter out the current file and find old ones for this recipe
    const oldFiles = files
      .filter((file) => {
        const fullPath = `${userId}/${file.name}`;
        return (
          file.name.startsWith(`${recipeId}-`) && fullPath !== currentFileName
        );
      })
      .map((file) => `${userId}/${file.name}`);

    if (oldFiles.length > 0) {
      await supabaseServer.storage.from(STORAGE_BUCKET).remove(oldFiles);
      console.log(`Cleaned up ${oldFiles.length} old image(s) for recipe ${recipeId}`);
    }
  } catch (err) {
    // Non-critical error, just log it
    console.error("Error cleaning up old images:", err);
  }
}

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
    const openaiImageUrl = data.data?.[0]?.url;

    if (!openaiImageUrl) {
      return new Response(
        JSON.stringify({ error: "No image URL returned from OpenAI" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Try to upload to Supabase Storage for permanent storage
    // Fall back to OpenAI URL if upload fails (temporary but better than nothing)
    let finalImageUrl = openaiImageUrl;
    let storageUploadSuccess = false;

    if (userId) {
      const { publicUrl, error: uploadError } =
        await uploadImageToSupabaseStorage(openaiImageUrl, userId, recipeId);

      if (publicUrl) {
        finalImageUrl = publicUrl;
        storageUploadSuccess = true;
        console.log("Successfully uploaded image to Supabase Storage");
      } else {
        console.warn(
          "Failed to upload to Supabase Storage, using OpenAI URL as fallback:",
          uploadError
        );
      }
    } else {
      console.warn("No userId provided, skipping Supabase Storage upload");
    }

    // Update the database with the image URL (Supabase Storage or OpenAI fallback)
    await updateRecipeImageUrl(recipeId, finalImageUrl, userId);

    return new Response(
      JSON.stringify({
        imageUrl: finalImageUrl,
        storageType: storageUploadSuccess ? "supabase" : "openai_temporary",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
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
