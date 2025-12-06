import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { image }: { image?: string } = await req.json();

    if (!image || typeof image !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid image payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const schema = z.object({
      ingredients: z
        .array(
          z.object({
            name: z.string().min(1).describe("Ingredient name in English"),
            quantity: z
              .string()
              .describe(
                "Approximate quantity in grams (g) for solids, milliliters (ml) for liquids, or pieces. Examples: '200g', '250ml', '3 pieces'"
              ),
          })
        )
        .default([])
        .describe("List of ingredients with their approximate quantities"),
    });

    const llmStart = Date.now();
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract visible food ingredients from this image with their approximate quantities. For each ingredient provide: 1) name in lowercase, singular English, 2) estimated quantity in grams (g) for solids, milliliters (ml) for liquids, or pieces (pieces) for countable items. Examples: {name: 'tomato', quantity: '3 pieces'}, {name: 'rice', quantity: '500g'}, {name: 'milk', quantity: '200ml'}. Return JSON only.",
            },
            { type: "image", image },
          ],
        },
      ],
    });
    const durationMs = Date.now() - llmStart;

    return new Response(JSON.stringify({ ...result.object, durationMs }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("/api/scan error", error);
    return new Response(JSON.stringify({ error: "Failed to scan image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
