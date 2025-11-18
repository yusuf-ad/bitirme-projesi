export type TabType = "groceries" | "pantry";

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
