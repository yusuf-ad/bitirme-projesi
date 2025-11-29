import { pantryService } from "@/features/pantry/services/pantry-service";
import { PantryItem } from "@/features/pantry/types";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

export function usePantryQuery() {
  const fetchPantryItems = useCallback(async (): Promise<PantryItem[]> => {
    try {
      console.log("Fetching pantry items from Supabase...");
      const data = await pantryService.getAllItems();
      console.log("Successfully fetched pantry items:", data.length);
      return data;
    } catch (error) {
      console.error("Error fetching pantry items:", error);
      throw error;
    }
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["pantry-items"],
    queryFn: fetchPantryItems,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
