import { Ingredient } from "@/lib/spoonacular";
import { create } from "zustand";

interface FilterStore {
  selectedIngredients: Ingredient[];
  selectedCuisines: string[];
  selectedFilters: string[];
  searchQuery: string;
  minReadyTime: number | null;
  maxReadyTime: number | null;
  minCalories: number | null;
  maxCalories: number | null;

  setSelectedIngredients: (ingredients: Ingredient[]) => void;
  setSelectedCuisines: (cuisines: string[]) => void;
  setSelectedFilters: (filters: string[]) => void;
  setSearchQuery: (query: string) => void;
  setReadyTimeRange: (range: { min: number | null; max: number | null }) => void;
  setCalorieRange: (range: { min: number | null; max: number | null }) => void;

  toggleFilter: (filter: string) => void;
  clearAllFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  selectedIngredients: [],
  selectedCuisines: [],
  selectedFilters: [],
  searchQuery: "",
  minReadyTime: null,
  maxReadyTime: null,
  minCalories: null,
  maxCalories: null,

  setSelectedIngredients: (ingredients) =>
    set({ selectedIngredients: ingredients }),

  setSelectedCuisines: (cuisines) => set({ selectedCuisines: cuisines }),

  setSelectedFilters: (filters) => set({ selectedFilters: filters }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setReadyTimeRange: ({ min, max }) =>
    set({
      minReadyTime: min,
      maxReadyTime: max,
    }),

  setCalorieRange: ({ min, max }) =>
    set({
      minCalories: min,
      maxCalories: max,
    }),

  // Only one quick filter can be selected at a time (radio button behavior)
  toggleFilter: (filter) =>
    set((state) => ({
      selectedFilters: state.selectedFilters.includes(filter)
        ? [] // Deselect if already selected
        : [filter], // Replace with only this filter
    })),

  clearAllFilters: () =>
    set({
      selectedIngredients: [],
      selectedCuisines: [],
      selectedFilters: [],
      searchQuery: "",
      minReadyTime: null,
      maxReadyTime: null,
      minCalories: null,
      maxCalories: null,
    }),
}));
