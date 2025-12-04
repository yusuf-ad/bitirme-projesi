import { buildUserContextPrompt, getUserContextForAI } from "@/lib/ai-user-context";
import { searchRecipes } from "@/lib/spoonacular";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();

const BASE_SYSTEM_PROMPT = `You are a professional food and nutrition assistant. You know the user and provide personalized recommendations.

## Your Capabilities:
- Recommend recipes based on user's pantry ingredients
- Provide nutrition and diet advice
- Share information about calories and nutritional values
- Share cooking techniques and tips

## IMPORTANT - Recipe Suggestion Format:
When user asks for recipe suggestions, ALWAYS use this format:

1. First write a short, friendly explanation (1-2 sentences)
2. Then write recipe suggestions in [[RECIPE:english_recipe_name:max_time]] format
   - max_time: If user specified time (e.g., "under 30 minutes"), write that time, otherwise leave empty
   
Example formats:
- With time: "Here's a quick and delicious option! [[RECIPE:chicken_stir_fry:30]]"
- Without time: "Here's a great recipe for you! [[RECIPE:beef_tacos]]"
- Two suggestions: "Here are two options for you! [[RECIPE:pasta_primavera:20]] [[RECIPE:grilled_salmon:25]]"

## Important Rules:
- The number of [[RECIPE:...]] tags you write = number of recipes shown
- If you say "two suggestions", write EXACTLY 2 [[RECIPE:...]] tags
- If you say "three options", write EXACTLY 3 [[RECIPE:...]] tags
- Recipe names must be in ENGLISH and popular (findable on Spoonacular)
- If user mentions time (e.g., "30 minutes", "quick", "fast"), always add :time
- ALWAYS suggest DIFFERENT recipes each time
- If user says "another" or "different", suggest from a COMPLETELY DIFFERENT category

## General Rules:
- Respond in the SAME LANGUAGE the user writes in (if they write in Turkish, respond in Turkish; if English, respond in English)
- Pay attention to user's allergies
- Be friendly and helpful
- NEVER suggest the same recipe twice`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RecipeSuggestion {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
}

interface ParsedRecipe {
  name: string;
  maxTime?: number;
}

// Extract recipe names and optional time constraints from AI response
function extractRecipeInfo(content: string): ParsedRecipe[] {
  const regex = /\[\[RECIPE:([^\]:\s]+)(?::(\d+))?\]\]/g;
  const recipes: ParsedRecipe[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    recipes.push({
      name: match[1].replace(/_/g, " "),
      maxTime: match[2] ? parseInt(match[2], 10) : undefined,
    });
  }
  return recipes;
}

// Search for a single recipe with optional time filter
async function searchSingleRecipe(
  name: string, 
  maxTime?: number
): Promise<RecipeSuggestion | null> {
  try {
    const result = await searchRecipes(name, 0, 5, maxTime ? { maxReadyTime: maxTime } : undefined);
    
    // Find the best match (prefer ones within time limit if specified)
    for (const recipe of result.recipes) {
      if (!maxTime || (recipe.readyInMinutes && recipe.readyInMinutes <= maxTime)) {
        return {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
        };
      }
    }
    
    // If no time-filtered match, return first result
    if (result.recipes.length > 0) {
      const recipe = result.recipes[0];
      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching for recipe "${name}":`, error);
    return null;
  }
}

// Search for recipes based on AI's suggestions
async function findRecipeSuggestions(parsedRecipes: ParsedRecipe[]): Promise<RecipeSuggestion[]> {
  const suggestions: RecipeSuggestion[] = [];
  const seenIds = new Set<number>();
  
  // Search each recipe individually to respect the count AI specified
  for (const parsed of parsedRecipes) {
    const recipe = await searchSingleRecipe(parsed.name, parsed.maxTime);
    if (recipe && !seenIds.has(recipe.id)) {
      seenIds.add(recipe.id);
      suggestions.push(recipe);
    }
  }
  
  return suggestions;
}

// Clean the response by removing recipe tags
function cleanResponse(content: string): string {
  return content.replace(/\[\[RECIPE:[^\]]+\]\]/g, "").trim();
}

export async function POST(req: Request) {
  try {
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    const userId: string | undefined = body.userId;

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build personalized system prompt with user context
    let systemPrompt = BASE_SYSTEM_PROMPT;
    
    if (userId) {
      try {
        const userContext = await getUserContextForAI(userId);
        const contextPrompt = buildUserContextPrompt(userContext);
        if (contextPrompt) {
          systemPrompt = BASE_SYSTEM_PROMPT + contextPrompt;
        }
      } catch {
        // Continue without user context
      }
    }

    // Extract previously suggested recipes from conversation to avoid repetition
    const previouslyRecommended: string[] = [];
    for (const msg of messages) {
      if (msg.role === "assistant") {
        const recipes = extractRecipeInfo(msg.content);
        previouslyRecommended.push(...recipes.map(r => r.name));
      }
    }
    
    if (previouslyRecommended.length > 0) {
      systemPrompt += `\n\n--- DAHA ÖNCE ÖNERİLEN YEMEKLERİ TEKRAR ÖNERME ---\nBu sohbette zaten önerdiğin yemekler: ${previouslyRecommended.join(", ")}\nBunları TEKRAR önerme, farklı yemekler öner!`;
    }

    // OpenAI API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 1000,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      return new Response(
        JSON.stringify({ error: "OpenAI API error", details: errorText }),
        { status: openaiResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await openaiResponse.json();
    const rawContent = data.choices[0]?.message?.content || "Yanıt alınamadı.";
    
    // Extract recipe info and search for them
    const parsedRecipes = extractRecipeInfo(rawContent);
    let recipes: RecipeSuggestion[] = [];
    
    if (parsedRecipes.length > 0) {
      recipes = await findRecipeSuggestions(parsedRecipes);
    }
    
    // Clean the response content
    const cleanedContent = cleanResponse(rawContent);

    return new Response(
      JSON.stringify({ 
        role: "assistant", 
        content: cleanedContent,
        recipes: recipes.length > 0 ? recipes : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
