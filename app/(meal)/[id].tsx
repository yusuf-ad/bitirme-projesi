import { MealDetailScreen } from "@/features/meal-detail";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

export default function MealDetailPage() {
  const { id, mealSlot } = useLocalSearchParams<{
    id?: string | string[];
    mealSlot?: string;
  }>();

  const mealId = useMemo(() => {
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const numericId = normalizedId ? Number(normalizedId) : NaN;
    return Number.isFinite(numericId) ? numericId : null;
  }, [id]);

  return <MealDetailScreen mealId={mealId} mealSlot={mealSlot} />;
}
