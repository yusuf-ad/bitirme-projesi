import { POPULAR_INGREDIENTS } from "@/lib/constants";
import type { AllergyItem } from "../types";

// Base URL for ingredient images from Spoonacular
export const INGREDIENT_IMAGE_BASE_URL =
  "https://spoonacular.com/cdn/ingredients_100x100";

// Debounce delay for search - Spoonacular allows max 2 requests/second
export const SEARCH_DEBOUNCE_MS = 800;

/**
 * Creates a fallback allergy item when full data is not available
 * Used when restoring selection from saved IDs
 */
export const createFallbackAllergyItem = (
  key: string
): AllergyItem & { _originalKey?: string } => {
  if (key.startsWith("name-")) {
    const formatted = key
      .replace("name-", "")
      .split("-")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
    return { name: formatted, _originalKey: key };
  }
  // For numeric IDs, show as "Item #ID" - will be replaced when found in search
  if (/^\d+$/.test(key)) {
    return { name: `Item #${key}`, _originalKey: key };
  }
  return { name: key, _originalKey: key };
};

/**
 * Safely extracts the display name from an allergy item
 * Handles all item types: API Ingredient, Popular Ingredient, and fallback
 */
export const getIngredientDisplayName = (item: AllergyItem): string => {
  // Check for name property on Ingredient type (from API)
  if ("name" in item && typeof item.name === "string" && item.name) {
    return item.name;
  }
  // Check for name on popular ingredients
  if ("name" in item && item.name) {
    return String(item.name);
  }
  // Fallback for unknown items
  return "Unknown Ingredient";
};

/**
 * Safely extracts and formats the ingredient image URL
 * Returns null if no image is available
 */
export const getIngredientImageUrl = (item: AllergyItem): string | null => {
  // Check for image property on Ingredient type (from API)
  if ("image" in item && typeof item.image === "string" && item.image) {
    const imagePath = item.image;
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // Otherwise, construct the full URL
    return `${INGREDIENT_IMAGE_BASE_URL}/${imagePath}`;
  }
  return null;
};

/**
 * Gets a unique key for an allergy item
 * Used for Map keys and list item keys
 */
export const getIngredientKey = (item: AllergyItem): string => {
  // Check for _originalKey first (for fallback items)
  if ("_originalKey" in item && (item as any)._originalKey) {
    return (item as any)._originalKey;
  }
  if ("id" in item && typeof item.id === "number") {
    return `${item.id}`;
  }
  const spoonacularId = (item as (typeof POPULAR_INGREDIENTS)[number])
    .spoonacularId;
  if (typeof spoonacularId === "number") {
    return `${spoonacularId}`;
  }
  return `name-${(item as any).name?.toLowerCase?.() ?? "unknown"}`;
};

