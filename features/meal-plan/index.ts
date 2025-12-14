export {
  CALORIE_RANGE_OPTIONS,
  COOKING_TIME_OPTIONS,
  ChipSection,
  InfoChip,
  MEAL_TYPE_OPTIONS,
  SelectableChip,
} from "./components/ai-generator-chips";
export type {
  MealTypeOption as AIMealTypeOption,
  CalorieRangeOption,
  ChipOption,
  CookingTimeOption,
} from "./components/ai-generator-chips";
export { AIRecipeGenerating } from "./components/ai-recipe-generating";
export { AIRecipePreview } from "./components/ai-recipe-preview";
export { DailyMealsList } from "./components/daily-meals-list";
export { DateMealRow } from "./components/date-meal-row";
export { EmptyMealSlot } from "./components/empty-meal-slot";
export { IngredientSelectionModal } from "./components/ingredient-selection-modal";
export type {
  IngredientSelectionModalHandle,
  SelectedIngredient,
} from "./components/ingredient-selection-modal";
export { MealPlanEmptyState } from "./components/meal-plan-empty-state";
export { MealPlanFooter } from "./components/meal-plan-footer";
export { MealSelectionCard } from "./components/meal-selection-card";
export { MealSelectionHeader } from "./components/meal-selection-header";
export { MealTypeLabels } from "./components/meal-type-labels";
export { UserPreferencesSection } from "./components/user-preferences-section";
export type {
  DisplayCookingSkill,
  DisplayGoal,
} from "./components/user-preferences-section";
export { useMealPlanGenerator } from "./hooks/use-meal-plan-generator";
export { mealPlanIngredientsService } from "./services/meal-plan-ingredients-service";
export type { AddToShoppingListResult } from "./services/meal-plan-ingredients-service";
export type { MealPlanItemRecord, MealPlanRecord, MealSlot } from "./types";
export { fetchMoreRecipes, fetchRecipes } from "./utils/fetch-recipes";
export type { FetchedRecipe, MealTypeResults } from "./utils/fetch-recipes";

// Preview components
export {
  EmptyMealState,
  LoadingOverlay,
  MealItem,
  PreviewFooter,
  PreviewHeader,
  formatDate,
  normalizeDateParam,
  useMealPlanPreview,
} from "./components/preview";
export type {
  EmptyMealStateProps,
  LoadingOverlayProps,
  MealItemProps,
  PreviewFooterProps,
  PreviewHeaderProps,
} from "./components/preview";
