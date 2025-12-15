import { POPULAR_INGREDIENTS } from "@/lib/constants";
import { type Ingredient } from "@/lib/spoonacular";

// Union type for all possible allergy item formats
export type AllergyItem =
  | Ingredient
  | (typeof POPULAR_INGREDIENTS)[number]
  | { name: string; image?: string };

// Props for the main TasteAllergies component
export interface TasteAllergiesProps {
  title: string;
  description?: string;
  onSelectionChange?: (selectedAllergies: string[]) => void;
  initialSelection?: string[];
}

// Theme colors type (subset used in this feature)
export interface AllergyThemeColors {
  background: {
    surface: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  gray: {
    [key: number]: string;
  };
  lilac: {
    [key: number]: string;
  };
}

