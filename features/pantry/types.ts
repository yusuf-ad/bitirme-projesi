<<<<<<< HEAD
import { PANTRY_CATEGORIES } from "@/lib/constants";

export type TabType = "my-ingredients" | "recipe-ideas";
=======
export type TabType = "groceries" | "pantry";
>>>>>>> parent of 3884a76 (Merge pull request #37 from yusuf-ad/yusuf)

export interface PantryItem {
  id: string;
  name: string;
  amount: string;
  recipe: string;
  checked: boolean;
  category: "dairy" | "meat" | "produce" | "other";
}

export interface ScannedItem {
  isWeight: boolean;
  name: string;
  parsedAmount: number;
  parsedUnit: string;
  quantity: string;
  spoonacularId: number;
  spoonacularImage: string;
  spoonacularName: string;
}
