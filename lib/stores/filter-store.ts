import { Ingredient } from "@/lib/spoonacular";
import { create } from "zustand";

interface FilterStore {
  selectedIngredients: Ingredient[];
  selectedCuisines: string[];
  selectedFilters: string[];
  searchQuery: string;
  minReadyTime: number | null;
  maxReadyTime: number | null;

  setSelectedIngredients: (ingredients: Ingredient[]) => void;
  setSelectedCuisines: (cuisines: string[]) => void;
  setSelectedFilters: (filters: string[]) => void;
  setSearchQuery: (query: string) => void;
  setReadyTimeRange: (range: { min: number | null; max: number | null }) => void;

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

  toggleFilter: (filter) =>
    set((state) => ({
      selectedFilters: state.selectedFilters.includes(filter)
        ? state.selectedFilters.filter((f) => f !== filter)
        : [...state.selectedFilters, filter],
    })),

  clearAllFilters: () =>
    set({
      selectedIngredients: [],
      selectedCuisines: [],
      selectedFilters: [],
      searchQuery: "",
      minReadyTime: null,
      maxReadyTime: null,
    }),
}));
