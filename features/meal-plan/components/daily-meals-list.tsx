import { Colors } from "@/constants/theme";
import MealCard from "@/features/home/components/meal-card";
import { MealPlanItemRecord, MealSlot } from "@/features/meal-plan/types";
import { useDeleteMealItem } from "@/hooks/use-delete-meal-item";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import Animated, {
    FadeInDown,
    SharedValue,
} from "react-native-reanimated";
import { EmptyMealSlot } from "./empty-meal-slot";

interface DailyMealsListProps {
  items: MealPlanItemRecord[];
  selectedDate: Date;
  scrollY: SharedValue<number>;
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

export function DailyMealsList({ items, selectedDate, scrollY }: DailyMealsListProps) {
  const deleteMutation = useDeleteMealItem();
  const [eatenMeals, setEatenMeals] = useState<Set<number>>(new Set());
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // Reset animation when date changes
  useEffect(() => {
    setShouldAnimate(true);
    const timer = setTimeout(() => setShouldAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedDate.toISOString()]);

  // Group meals by type
  const mealsByType = new Map<MealSlot, MealPlanItemRecord>();
  items.forEach((item) => {
    if ((MEAL_ORDER as readonly string[]).includes(item.meal_type)) {
      mealsByType.set(item.meal_type, item);
    }
  });

  const handleDelete = (mealId: number) => {
    deleteMutation.mutate(mealId);
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

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {MEAL_ORDER.map((mealType, index) => {
          const item = mealsByType.get(mealType);
          const details = DEFAULT_MEAL_DETAILS[mealType];
          const staggerDelay = index * 100; // 100ms delay between each card

          if (!item) {
            // Show empty slot for missing meals
            return (
              <Animated.View
                key={mealType}
                entering={shouldAnimate ? FadeInDown.delay(staggerDelay).duration(400).springify() : undefined}
              >
                <EmptyMealSlot
                  mealType={details.label}
                  mealTime={details.time}
                  mealIcon={details.icon}
                  mealSlot={mealType}
                  selectedDate={selectedDate}
                  scrollY={scrollY}
                />
              </Animated.View>
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
            <Animated.View
              key={item.id}
              entering={shouldAnimate ? FadeInDown.delay(staggerDelay).duration(400).springify() : undefined}
            >
              <MealCard
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
                  router.push(`/(meal)/${item.spoonacular_recipe_id}`)
                }
                onDelete={() => handleDelete(item.id)}
                onToggleEaten={(eaten) => handleToggleEaten(item.id, eaten)}
              />
            </Animated.View>
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
