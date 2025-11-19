import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { PANTRY_CATEGORIES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const { ingredients }: { ingredients: string[] } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid ingredients list" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Use the imported categories for validation
    const validCategories = [...PANTRY_CATEGORIES];

    const schema = z.object({
      items: z.array(
        z.object({
          name: z.string(),
          category: z.enum(validCategories as [string, ...string[]]),
        })
      ),
    });

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You are a kitchen assistant. Categorize the given ingredients into one of the following categories: ${validCategories.join(
            ", "
          )}. Return a JSON object with an array of items, each having a name and a category.`,
        },
        {
          role: "user",
          content: JSON.stringify(ingredients),
        },
      ],
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("/api/categorize error", error);
    return new Response(
      JSON.stringify({ error: "Failed to categorize items" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

