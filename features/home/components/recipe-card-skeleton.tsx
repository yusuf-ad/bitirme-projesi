import { Colors } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

export function RecipeCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.skeletonImage} />
      <View style={styles.contentContainer}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonMeta} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.background.surface,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    marginHorizontal: 12,
    maxWidth: "48%",
  },
  skeletonImage: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.gray[200],
  },
  contentContainer: {
    padding: 12,
    gap: 8,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonMeta: {
    height: 12,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    width: "70%",
  },
});
