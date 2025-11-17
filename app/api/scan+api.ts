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

    const result = await generateObject({
      model: openai("gpt-4o"),
      schema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are a vision assistant. From this image, extract a flat list of visible food ingredients only. No utensils, brands, packaging text, quantities, or descriptions. Use lowercase, singular words, deduplicate similar items (e.g., 'tomato' once). Return JSON only.",
            },
            { type: "image", image },
          ],
        },
      ],
    });

    return new Response(JSON.stringify(result.object), {
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
