import type { Meal, MealPlan, MealType } from "@/lib/utils";

export interface MealItemProps {
  meal: Meal;
  mealType: MealType;
  isAiGenerated: boolean;
  onReplace: () => void;
  onPress: () => void;
}

export interface EmptyMealStateProps {
  mealType: MealType;
  onGenerateWithAI: (mealType: MealType) => void;
}

export interface PreviewHeaderProps {
  onBack: () => void;
  onClose: () => void;
}

export interface PreviewFooterProps {
  onSave: () => void;
  isSaving: boolean;
  isAddingToShoppingList: boolean;
}

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export interface MealPlanPreviewState {
  mealPlan: MealPlan | undefined;
  isSaving: boolean;
  isAddingToShoppingList: boolean;
  selectedMealIndices: Partial<Record<MealType, number>>;
  activeMealType: MealType | null;
  aiGeneratedTypes: Partial<Record<MealType, boolean>>;
  isLoadingMore: boolean;
}

export interface UseMealPlanPreviewReturn extends MealPlanPreviewState {
  planStartDate: Date;
  planEndDate: Date;
  allMeals: Meal[];
  currentSelectedIndex: number;
  alternativeMealsWithIndex: { meal: Meal; index: number }[];
  modalMeals: Meal[];
  hasMorePages: boolean;
  modalTitle: string;
  handleMealSelect: (selectedMeal: Meal) => void;
  handleModalDismiss: () => void;
  handleLoadMore: () => Promise<void>;
  handleSaveMealPlan: () => Promise<void>;
  handleGenerateWithAI: (mealType: MealType) => void;
  setActiveMealType: (mealType: MealType | null) => void;
  renderDayMeals: (mealType: MealType) => {
    meal: Meal | null;
    index: number;
  } | null;
}

