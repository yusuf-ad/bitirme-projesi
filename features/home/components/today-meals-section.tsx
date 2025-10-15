import MealCard from "@/features/home/components/meal-card";
import { mockMeals } from "@/features/home/data/mock-data";
import { StyleSheet, View } from "react-native";

export default function TodayMealsSection() {
  return (
    <View style={styles.todayMealsSection}>
      {mockMeals.map((meal) => (
        <MealCard
          key={meal.id}
          mealType={meal.mealType}
          mealTime={meal.mealTime}
          mealIcon={meal.mealIcon}
          recipeName={meal.recipeName}
          recipeDescription={meal.recipeDescription}
          recipeImage={meal.recipeImage}
          prepTime={meal.prepTime}
          calories={meal.calories}
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
