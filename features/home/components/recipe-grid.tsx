import { Recipe } from "@/lib/spoonacular";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { RecipeCard } from "./recipe-card";

interface RecipeGridProps {
  recipes: Recipe[];
  favoriteIds?: Set<number>;
  onToggleFavorite?: (recipe: Recipe) => void;
}

export function RecipeGrid({
  recipes,
  favoriteIds,
  onToggleFavorite,
}: RecipeGridProps) {
  const params = useLocalSearchParams<{ mealSlot?: string }>();
  const mealSlot = params.mealSlot;

  return (
    <View style={styles.gridContainer}>
      {recipes.map((recipe) => (
        <View key={recipe.id} style={styles.gridItem}>
          <RecipeCard
            recipe={recipe}
            onPress={() => {
              const navigationParams: any = { id: recipe.id };
              if (mealSlot) {
                navigationParams.mealSlot = mealSlot;
              }
              router.push({
                pathname: "/(meal)/[id]",
                params: navigationParams,
              });
            }}
            isFavorite={favoriteIds?.has(recipe.id)}
            onToggleFavorite={
              onToggleFavorite ? () => onToggleFavorite(recipe) : undefined
            }
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
