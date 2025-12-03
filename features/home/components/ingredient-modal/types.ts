import { POPULAR_INGREDIENTS } from "@/lib/constants";
import { Ingredient } from "@/lib/spoonacular";

export type PopularIngredient = (typeof POPULAR_INGREDIENTS)[0];
export type IngredientItem = Ingredient | PopularIngredient;

export interface IngredientModalProps {
  onIngredientsSelect?: (ingredients: Ingredient[]) => void;
}

export interface DisplayAllergy {
  id: string;
  name: string;
  image?: string;
  imageUrl?: string;
}

export interface IngredientItemComponentProps {
  item: IngredientItem;
  isSelected: boolean;
  onPress: () => void;
}

export interface FloatingChipProps {
  item: IngredientItem;
  onPress: () => void;
}

export interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
}

export interface AllergiesModalProps {
  visible: boolean;
  onClose: () => void;
  allergies: DisplayAllergy[];
  onNavigateToSettings?: () => void;
}

export interface FloatingSelectedBarProps {
  selectedItems: IngredientItem[];
  getIngredientKey: (item: IngredientItem) => string;
  toggleIngredient: (item: IngredientItem) => void;
}

export interface BottomActionsProps {
  selectedCount: number;
  onClearAll: () => void;
  onApply: () => void;
}

export interface ListHeaderProps {
  selectedItems: IngredientItem[];
  isScrolledDown: boolean;
  hasSearched: boolean;
  getIngredientKey: (item: IngredientItem) => string;
  toggleIngredient: (item: IngredientItem) => void;
}
