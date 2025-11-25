import { findRecipesByIngredients } from "@/lib/spoonacular";

export async function POST(req: Request) {
  try {
    const { ingredients } = await req.json();

    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return new Response(
        JSON.stringify({ error: "Ingredients list is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const recipes = await findRecipesByIngredients(ingredients);

    return new Response(JSON.stringify(recipes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error suggesting recipes by ingredients:", error);
    return new Response(
      JSON.stringify({ error: "Failed to suggest recipes" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
