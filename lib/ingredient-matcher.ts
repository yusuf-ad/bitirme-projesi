import { PantryCategory, PantryItem } from "@/features/pantry/types";
import { ExtendedIngredient } from "./spoonacular";

/**
 * Recipe ingredient with normalized data for comparison
 */
export interface RecipeIngredient {
  id?: number;
  name: string;
  amount: number;
  unit: string;
  aisle?: string;
  image?: string;
  original?: string;
  recipeName?: string; // Which recipe this ingredient belongs to
}

/**
 * Result of comparing recipe ingredients with pantry
 */
export interface IngredientComparisonResult {
  /** Ingredients completely missing from pantry */
  missing: RecipeIngredient[];
  /** Ingredients in pantry but with insufficient quantity */
  insufficient: {
    ingredient: RecipeIngredient;
    pantryItem: PantryItem;
    neededAmount: number;
  }[];
  /** Ingredients already in pantry with sufficient quantity */
  available: {
    ingredient: RecipeIngredient;
    pantryItem: PantryItem;
  }[];
}

/**
 * Normalize ingredient name for comparison
 * Removes common variations, plurals, and extra whitespace
 */
export function normalizeIngredientName(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      // Remove common descriptors
      .replace(
        /\b(fresh|dried|frozen|canned|organic|raw|cooked|chopped|sliced|diced|minced|ground|whole|large|medium|small|boneless|skinless)\b/g,
        ""
      )
      // Remove extra whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Check if two ingredient names match
 * Uses spoonacular_id first, then falls back to name comparison
 */
export function ingredientsMatch(
  recipeIngredient: RecipeIngredient,
  pantryItem: PantryItem
): boolean {
  // Primary match: spoonacular_id
  if (
    recipeIngredient.id &&
    pantryItem.spoonacular_id &&
    recipeIngredient.id === pantryItem.spoonacular_id
  ) {
    return true;
  }

  // Secondary match: normalized name comparison
  const normalizedRecipeName = normalizeIngredientName(recipeIngredient.name);
  const normalizedPantryName = normalizeIngredientName(pantryItem.name);
  const normalizedSpoonacularName = pantryItem.spoonacular_name
    ? normalizeIngredientName(pantryItem.spoonacular_name)
    : "";

  // Exact match
  if (normalizedRecipeName === normalizedPantryName) return true;
  if (
    normalizedSpoonacularName &&
    normalizedRecipeName === normalizedSpoonacularName
  )
    return true;

  // Partial match (one contains the other)
  if (
    normalizedRecipeName.includes(normalizedPantryName) ||
    normalizedPantryName.includes(normalizedRecipeName)
  ) {
    return true;
  }

  if (
    normalizedSpoonacularName &&
    (normalizedRecipeName.includes(normalizedSpoonacularName) ||
      normalizedSpoonacularName.includes(normalizedRecipeName))
  ) {
    return true;
  }

  return false;
}

/**
 * Unit conversion factors to a common base (grams for weight, ml for volume)
 */
const UNIT_CONVERSIONS: Record<
  string,
  { factor: number; type: "weight" | "volume" | "count" }
> = {
  // Weight units (to grams)
  g: { factor: 1, type: "weight" },
  gram: { factor: 1, type: "weight" },
  grams: { factor: 1, type: "weight" },
  kg: { factor: 1000, type: "weight" },
  kilogram: { factor: 1000, type: "weight" },
  kilograms: { factor: 1000, type: "weight" },
  oz: { factor: 28.35, type: "weight" },
  ounce: { factor: 28.35, type: "weight" },
  ounces: { factor: 28.35, type: "weight" },
  lb: { factor: 453.59, type: "weight" },
  lbs: { factor: 453.59, type: "weight" },
  pound: { factor: 453.59, type: "weight" },
  pounds: { factor: 453.59, type: "weight" },

  // Volume units (to ml)
  ml: { factor: 1, type: "volume" },
  milliliter: { factor: 1, type: "volume" },
  milliliters: { factor: 1, type: "volume" },
  l: { factor: 1000, type: "volume" },
  liter: { factor: 1000, type: "volume" },
  liters: { factor: 1000, type: "volume" },
  cup: { factor: 236.59, type: "volume" },
  cups: { factor: 236.59, type: "volume" },
  tbsp: { factor: 14.79, type: "volume" },
  tablespoon: { factor: 14.79, type: "volume" },
  tablespoons: { factor: 14.79, type: "volume" },
  tsp: { factor: 4.93, type: "volume" },
  teaspoon: { factor: 4.93, type: "volume" },
  teaspoons: { factor: 4.93, type: "volume" },
  floz: { factor: 29.57, type: "volume" },
  "fl oz": { factor: 29.57, type: "volume" },

  // Count units
  piece: { factor: 1, type: "count" },
  pieces: { factor: 1, type: "count" },
  count: { factor: 1, type: "count" },
  item: { factor: 1, type: "count" },
  items: { factor: 1, type: "count" },
  bunch: { factor: 1, type: "count" },
  pkg: { factor: 1, type: "count" },
  package: { factor: 1, type: "count" },
  can: { factor: 1, type: "count" },
  jar: { factor: 1, type: "count" },
  loaf: { factor: 1, type: "count" },
  gallon: { factor: 3785.41, type: "volume" },
  clove: { factor: 1, type: "count" },
  cloves: { factor: 1, type: "count" },
  "": { factor: 1, type: "count" }, // Default for no unit
};

/**
 * Normalize unit string for lookup
 */
function normalizeUnit(unit: string): string {
  return unit.toLowerCase().trim().replace(/\./g, "");
}

/**
 * Check if pantry has sufficient quantity of an ingredient
 * Returns the amount still needed (0 if sufficient)
 */
export function calculateNeededAmount(
  recipeIngredient: RecipeIngredient,
  pantryItem: PantryItem
): number {
  const recipeUnit = normalizeUnit(recipeIngredient.unit);
  const pantryUnit = normalizeUnit(pantryItem.unit);

  const recipeConversion = UNIT_CONVERSIONS[recipeUnit];
  const pantryConversion = UNIT_CONVERSIONS[pantryUnit];

  // If we can't convert units, assume we need it if pantry amount is less than recipe amount
  if (!recipeConversion || !pantryConversion) {
    // Same unit or both unknown - direct comparison
    if (recipeUnit === pantryUnit || (!recipeConversion && !pantryConversion)) {
      const needed = recipeIngredient.amount - pantryItem.amount;
      return Math.max(0, needed);
    }
    // Different unknown units - can't compare, assume we have enough
    return 0;
  }

  // Different unit types can't be compared
  if (recipeConversion.type !== pantryConversion.type) {
    // Can't compare weight vs volume vs count - assume we need it
    return recipeIngredient.amount;
  }

  // Convert both to common base and compare
  const recipeAmountNormalized =
    recipeIngredient.amount * recipeConversion.factor;
  const pantryAmountNormalized = pantryItem.amount * pantryConversion.factor;

  const neededNormalized = recipeAmountNormalized - pantryAmountNormalized;

  if (neededNormalized <= 0) return 0;

  // Convert back to recipe units
  return neededNormalized / recipeConversion.factor;
}

/**
 * Map Spoonacular aisle to pantry category
 */
export function mapAisleToCategory(aisle: string): PantryCategory {
  const lowerAisle = (aisle || "").toLowerCase();

  if (
    lowerAisle.includes("produce") ||
    lowerAisle.includes("fruit") ||
    lowerAisle.includes("vegetable")
  )
    return "Fruits & Vegetables";

  if (
    lowerAisle.includes("meat") ||
    lowerAisle.includes("seafood") ||
    lowerAisle.includes("fish") ||
    lowerAisle.includes("poultry")
  )
    return "Meat & Seafood";

  if (
    lowerAisle.includes("milk") ||
    lowerAisle.includes("cheese") ||
    lowerAisle.includes("dairy") ||
    lowerAisle.includes("egg")
  )
    return "Dairy";

  if (
    lowerAisle.includes("pasta") ||
    lowerAisle.includes("grain") ||
    lowerAisle.includes("rice") ||
    lowerAisle.includes("cereal") ||
    lowerAisle.includes("baking")
  )
    return "Pasta, Sauces & Grain";

  if (lowerAisle.includes("bakery") || lowerAisle.includes("bread"))
    return "Bakery";

  if (lowerAisle.includes("frozen")) return "Frozen";

  if (lowerAisle.includes("canned")) return "Canned";

  if (
    lowerAisle.includes("spice") ||
    lowerAisle.includes("seasoning") ||
    lowerAisle.includes("oil") ||
    lowerAisle.includes("herb")
  )
    return "Spices";

  if (
    lowerAisle.includes("condiment") ||
    lowerAisle.includes("dressing") ||
    lowerAisle.includes("nut") ||
    lowerAisle.includes("sauce")
  )
    return "Condiments";

  if (lowerAisle.includes("snack") || lowerAisle.includes("chip"))
    return "Snacks";

  return "Other";
}

/**
 * Compare recipe ingredients with pantry items
 * Returns missing, insufficient, and available ingredients
 */
export function compareIngredientsWithPantry(
  recipeIngredients: RecipeIngredient[],
  pantryItems: PantryItem[]
): IngredientComparisonResult {
  const result: IngredientComparisonResult = {
    missing: [],
    insufficient: [],
    available: [],
  };

  // Filter only pantry status items (not shopping list)
  const pantryStock = pantryItems.filter((item) => item.status === "pantry");

  for (const ingredient of recipeIngredients) {
    // Find matching pantry item
    const matchingPantryItem = pantryStock.find((pantryItem) =>
      ingredientsMatch(ingredient, pantryItem)
    );

    if (!matchingPantryItem) {
      // Ingredient not in pantry at all
      result.missing.push(ingredient);
    } else {
      // Check quantity
      const neededAmount = calculateNeededAmount(
        ingredient,
        matchingPantryItem
      );

      if (neededAmount > 0) {
        // Not enough in pantry
        result.insufficient.push({
          ingredient,
          pantryItem: matchingPantryItem,
          neededAmount,
        });
      } else {
        // Sufficient quantity in pantry
        result.available.push({
          ingredient,
          pantryItem: matchingPantryItem,
        });
      }
    }
  }

  return result;
}

/**
 * Convert ExtendedIngredient from Spoonacular to RecipeIngredient
 */
export function convertToRecipeIngredient(
  ingredient: ExtendedIngredient,
  recipeName?: string
): RecipeIngredient {
  return {
    id: ingredient.id,
    name: ingredient.name || ingredient.originalName,
    amount: ingredient.amount,
    unit: ingredient.unit || ingredient.unitShort || "",
    aisle: ingredient.aisle,
    image: ingredient.image,
    original: ingredient.original,
    recipeName,
  };
}

/**
 * Convert RecipeIngredient to PantryItem for adding to shopping list
 */
export function convertToPantryItem(
  ingredient: RecipeIngredient,
  amount?: number // Override amount if needed (e.g., for insufficient items)
): Omit<PantryItem, "id" | "user_id" | "created_at" | "updated_at"> {
  return {
    name: ingredient.name,
    amount: amount ?? ingredient.amount,
    unit: ingredient.unit,
    is_weight: isWeightUnit(ingredient.unit),
    spoonacular_id: ingredient.id,
    spoonacular_name: ingredient.name,
    spoonacular_image: ingredient.image,
    category: ingredient.aisle ? mapAisleToCategory(ingredient.aisle) : "Other",
    status: "shopping_list",
    checked: false,
    recipe_name: ingredient.recipeName,
  };
}

/**
 * Check if a unit is a weight unit
 */
function isWeightUnit(unit: string): boolean {
  const normalizedUnit = normalizeUnit(unit);
  const conversion = UNIT_CONVERSIONS[normalizedUnit];
  return conversion?.type === "weight";
}

/**
 * Merge duplicate ingredients (same ingredient from multiple recipes)
 * Combines amounts for ingredients with matching IDs or names
 */
export function mergeIngredients(
  ingredients: RecipeIngredient[]
): RecipeIngredient[] {
  const merged = new Map<string, RecipeIngredient>();

  for (const ingredient of ingredients) {
    // Create a key based on spoonacular_id or normalized name
    const key = ingredient.id
      ? `id:${ingredient.id}`
      : `name:${normalizeIngredientName(ingredient.name)}`;

    const existing = merged.get(key);

    if (existing) {
      // Merge amounts if units are compatible
      const existingUnit = normalizeUnit(existing.unit);
      const newUnit = normalizeUnit(ingredient.unit);

      if (existingUnit === newUnit) {
        existing.amount += ingredient.amount;
        // Combine recipe names
        if (ingredient.recipeName && existing.recipeName) {
          if (!existing.recipeName.includes(ingredient.recipeName)) {
            existing.recipeName = `${existing.recipeName}, ${ingredient.recipeName}`;
          }
        }
      } else {
        // Different units - try to convert
        const existingConversion = UNIT_CONVERSIONS[existingUnit];
        const newConversion = UNIT_CONVERSIONS[newUnit];

        if (
          existingConversion &&
          newConversion &&
          existingConversion.type === newConversion.type
        ) {
          // Convert to common base, add, then convert back to existing unit
          const totalNormalized =
            existing.amount * existingConversion.factor +
            ingredient.amount * newConversion.factor;
          existing.amount = totalNormalized / existingConversion.factor;
        } else {
          // Can't merge - add as separate entry with modified key
          merged.set(`${key}:${newUnit}`, { ...ingredient });
        }
      }
    } else {
      merged.set(key, { ...ingredient });
    }
  }

  return Array.from(merged.values());
}
