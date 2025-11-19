import { StyleSheet, View } from "react-native";
import { RecipeCardSkeleton } from "./recipe-card-skeleton";

interface LoadingStateProps {
  message?: string;
  count?: number;
}

export function LoadingState({
  message = "Loading recipes...",
  count = 6,
}: LoadingStateProps) {
  return (
    <View style={styles.gridContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <RecipeCardSkeleton key={`skeleton-${index}`} />
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
});
