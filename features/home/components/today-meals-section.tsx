import MealCard from "@/features/home/components/meal-card";
import { mockMeals } from "@/features/home/data/mock-data";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function TodayMealsSection() {
  const [eatenMeals, setEatenMeals] = useState<Set<string>>(new Set());

  const handleToggleEaten = (mealId: string, eaten: boolean) => {
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

  const handleDelete = (mealId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete meal:", mealId);
  };

  return (
    <View style={styles.todayMealsSection}>
      {mockMeals.map((meal) => (
        <MealCard
          key={meal.id}
          mealType={meal.mealType}
          mealTime={meal.mealTime}
          mealIcon={meal.mealIcon}
          recipeName={meal.recipeName}
          recipeImage={meal.recipeImage}
          prepTime={meal.prepTime}
          calories={meal.calories}
          isEaten={eatenMeals.has(meal.id)}
          onToggleEaten={(eaten) => handleToggleEaten(meal.id, eaten)}
          onDelete={() => handleDelete(meal.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  todayMealsSection: {
    gap: 12,
    paddingBottom: 24,
  },
});
