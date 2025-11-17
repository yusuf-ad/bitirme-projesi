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
        .array(z.string().min(1))
        .default([])
        .describe("Unique, concise ingredient names in English"),
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
              text: "Extract only visible food ingredients from this image as a flat, deduplicated list. No brands, text, utensils, quantities, or descriptions. Use lowercase, singular English words. Return JSON only.",
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
