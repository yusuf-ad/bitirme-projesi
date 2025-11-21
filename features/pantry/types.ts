import { PANTRY_CATEGORIES } from "@/lib/constants";

export type TabType = "my-ingredients" | "ai-chat";

export type PantryCategory = (typeof PANTRY_CATEGORIES)[number];

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  unit: string;
  is_weight: boolean;
  spoonacular_id?: number;
  spoonacular_name?: string;
  spoonacular_image?: string;
  category: PantryCategory;
  status: "pantry" | "shopping_list";
  checked: boolean;
  recipe_name?: string; // For shopping list items associated with a recipe
  created_at?: string;
  updated_at?: string;
}

// For the UI, we often use a slightly different shape or computed properties,
// but let's try to stick close to the DB shape or extend it.

export interface ScannedItem {
  isWeight: boolean;
  name: string;
  parsedAmount: number;
  parsedUnit: string;
  quantity: string;
  spoonacularId?: number;
  spoonacularImage?: string;
  spoonacularName?: string;
}
