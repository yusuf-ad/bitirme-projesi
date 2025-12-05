import { MealDetailScreen } from "@/features/meal-detail";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

export default function MealDetailPage() {
  const { id, mealSlot, isAiGenerated } = useLocalSearchParams<{
    id?: string | string[];
    mealSlot?: string;
    isAiGenerated?: string;
  }>();

  const mealId = useMemo(() => {
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const numericId = normalizedId ? Number(normalizedId) : NaN;
    return Number.isFinite(numericId) ? numericId : null;
  }, [id]);

  // Convert string param to boolean
  const isAiGeneratedBool = isAiGenerated === "true";

  return (
    <MealDetailScreen
      mealId={mealId}
      mealSlot={mealSlot}
      isAiGenerated={isAiGeneratedBool}
    />
  );
}
