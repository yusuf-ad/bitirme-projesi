import { Colors } from "@/constants/theme";
import MealCard from "@/features/home/components/meal-card";
import { MealPlanItemRecord, MealSlot } from "@/features/meal-plan/types";
import { useDeleteMealItem } from "@/hooks/use-delete-meal-item";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { EmptyMealSlot } from "./empty-meal-slot";

interface DailyMealsListProps {
  items: MealPlanItemRecord[];
  selectedDate: Date;
}

const MEAL_ORDER: ("breakfast" | "lunch" | "dinner")[] = [
  "breakfast",
  "lunch",
  "dinner",
];

const PLACEHOLDER_RECIPE_IMAGE = require("@/assets/images/image.png");

const DEFAULT_MEAL_DETAILS: Record<
  "breakfast" | "lunch" | "dinner" | "snack",
  { label: string; time: string; icon: ImageSourcePropType }
> = {
  breakfast: {
    label: "Breakfast",
    time: "07:00 - 08:00",
    icon: require("@/assets/icons/breakfast-icon.svg"),
  },
  lunch: {
    label: "Lunch",
    time: "12:00 - 13:00",
    icon: require("@/assets/icons/lunch-icon.svg"),
  },
  dinner: {
    label: "Dinner",
    time: "19:00 - 20:00",
    icon: require("@/assets/icons/dinner-icon.svg"),
  },
  snack: {
    label: "Snack",
    time: "15:00 - 15:30",
    icon: require("@/assets/icons/chef-icon.svg"),
  },
};

const DEFAULT_TIMES = {
  breakfast: { start: "07:00", end: "08:00" },
  lunch: { start: "12:00", end: "13:00" },
  dinner: { start: "19:00", end: "20:00" },
};

function formatTimeRange(
  time: { hour: number; minute: number; period: "AM" | "PM" } | undefined,
  defaultStart: string,
  defaultEnd: string
) {
  if (!time) return `${defaultStart} - ${defaultEnd}`;

  const startHour =
    time.period === "PM" && time.hour !== 12
      ? time.hour + 12
      : time.period === "AM" && time.hour === 12
      ? 0
      : time.hour;
  const endHour = startHour + 1; // Default duration 1 hour

  const formattedStart = `${String(startHour).padStart(2, "0")}:${String(
    time.minute
  ).padStart(2, "0")}`;
  const formattedEnd = `${String(endHour > 23 ? 0 : endHour).padStart(
    2,
    "0"
  )}:${String(time.minute).padStart(2, "0")}`;

  return `${formattedStart} - ${formattedEnd}`;
}

export function DailyMealsList({
  items,
  selectedDate,
  mealTimes,
}: DailyMealsListProps & {
  mealTimes?: {
    breakfast: { hour: number; minute: number; period: "AM" | "PM" };
    lunch: { hour: number; minute: number; period: "AM" | "PM" };
    dinner: { hour: number; minute: number; period: "AM" | "PM" };
  } | null;
}) {
  const deleteMutation = useDeleteMealItem();
  const [eatenMeals, setEatenMeals] = useState<Set<number>>(new Set());
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // Reset animation when date changes
  useEffect(() => {
    setShouldAnimate(true);
    const timer = setTimeout(() => setShouldAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Group meals by type
  const mealsByType = new Map<MealSlot, MealPlanItemRecord>();
  items.forEach((item) => {
    if ((MEAL_ORDER as readonly string[]).includes(item.meal_type)) {
      mealsByType.set(item.meal_type, item);
    }
  });

  const handleDelete = async (mealId: number) => {
    setDeletingId(mealId);
    try {
      await deleteMutation.mutateAsync(mealId);
    } catch (error) {
      // Error is handled by the mutation hook
      setDeletingId(null);
    }
    // Deleting ID will be cleared when component re-renders with item removed
    // or we can clear it here if we want to be safe in case of error
  };

  const handleToggleEaten = (mealId: number, eaten: boolean) => {
    setEatenMeals((prev) => {
      const newSet = new Set(prev);
      if (eaten) {
        newSet.add(mealId);
      } else {
        newSet.delete(mealId);
      }
      return newSet;
    });
  };

  const getMealDetails = (type: "breakfast" | "lunch" | "dinner") => {
    const base = DEFAULT_MEAL_DETAILS[type];
    const userTime = mealTimes?.[type];

    // Fallback defaults if no user time
    let defaultStart = "00:00";
    let defaultEnd = "00:00";

    switch (type) {
      case "breakfast":
        defaultStart = "07:00";
        defaultEnd = "08:00";
        break;
      case "lunch":
        defaultStart = "12:00";
        defaultEnd = "13:00";
        break;
      case "dinner":
        defaultStart = "19:00";
        defaultEnd = "20:00";
        break;
    }

    return {
      ...base,
      time: formatTimeRange(userTime, defaultStart, defaultEnd),
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {MEAL_ORDER.map((mealType, index) => {
          const item = mealsByType.get(mealType);
          const details = getMealDetails(mealType);
          const staggerDelay = index * 100; // 100ms delay between each card

          if (!item) {
            // Show empty slot for missing meals
            return (
              <EmptyMealSlot
                key={mealType}
                mealType={details.label}
                mealTime={details.time}
                mealIcon={details.icon}
                mealSlot={mealType}
                selectedDate={selectedDate}
              />
            );
          }

          // Render filled meal card
          const mealTime = details.time;
          const mealLabel = details.label;
          const mealIcon = details.icon;
          const calories = item.calories_per_serving
            ? `${item.calories_per_serving} kcal`
            : "—";
          const prepTime = item.ready_in_minutes
            ? `${item.ready_in_minutes} min`
            : "—";
          const recipeImage = item.recipe_image_url
            ? { uri: item.recipe_image_url }
            : PLACEHOLDER_RECIPE_IMAGE;
          const carbs = item.carbs_per_serving
            ? `${Math.round(item.carbs_per_serving)}g`
            : undefined;
          const protein = item.protein_per_serving
            ? `${Math.round(item.protein_per_serving)}g`
            : undefined;
          const fat = item.fat_per_serving
            ? `${Math.round(item.fat_per_serving)}g`
            : undefined;

          return (
            <MealCard
              key={item.id}
              mealType={mealLabel}
              mealTime={mealTime}
              mealIcon={mealIcon}
              recipeName={item.recipe_name}
              recipeImage={recipeImage}
              prepTime={prepTime}
              calories={calories}
              carbs={carbs}
              protein={protein}
              fat={fat}
              isEaten={eatenMeals.has(item.id)}
              onPress={() =>
                router.push({
                  pathname: "/(meal)/[id]",
                  params: {
                    id: item.spoonacular_recipe_id,
                    isAiGenerated: item.is_ai_generated ? "true" : "false",
                  },
                })
              }
              onDelete={() => handleDelete(item.id)}
              onToggleEaten={(eaten) => handleToggleEaten(item.id, eaten)}
              isLoading={deletingId === item.id}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  date: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[500],
  },
  planName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  list: {
    gap: 12,
  },
});
