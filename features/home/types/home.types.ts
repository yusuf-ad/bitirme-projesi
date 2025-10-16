import { ImageSourcePropType } from "react-native";

export interface CalendarDay {
  day: string;
  dayOfWeek: string;
  date: Date;
  isSelected: boolean;
}

export interface MacroProgress {
  type: "fat" | "protein" | "carb";
  percentage: number;
}

export interface Meal {
  id: string;
  mealType: string;
  mealTime: string;
  mealIcon: ImageSourcePropType;
  recipeName: string;
  recipeDescription: string;
  recipeImage: ImageSourcePropType;
  prepTime: string;
  calories: string;
}

export interface TodayProgress {
  calories: number;
  macros: MacroProgress[];
}
