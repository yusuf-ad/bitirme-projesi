import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { RecipeCard } from "./recipe-card";

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
}

interface RecipeGridProps {
  recipes: Recipe[];
}

export function RecipeGrid({ recipes }: RecipeGridProps) {
  return (
    <View style={styles.gridContainer}>
      {recipes.map((recipe) => (
        <View key={recipe.id} style={styles.gridItem}>
          <RecipeCard
            recipe={recipe}
            onPress={() => router.push(`/(meal)/${recipe.id}`)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
  },
});
