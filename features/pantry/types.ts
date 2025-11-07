export type TabType = "groceries" | "pantry";

export interface PantryItem {
  id: string;
  name: string;
  amount: string;
  recipe: string;
  checked: boolean;
  category: "dairy" | "meat" | "produce" | "other";
}

