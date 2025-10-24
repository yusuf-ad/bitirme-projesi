import { Colors } from "@/constants/theme";
import { Recipe } from "@/lib/spoonacular";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  return (
    <Pressable style={styles.itemCard} onPress={onPress}>
      <Image
        source={{ uri: recipe.image }}
        style={styles.itemImage}
        placeholder="L4|400"
        contentFit="cover"
      />

      <View style={styles.itemContentContainer}>
        <Text style={styles.itemText} numberOfLines={2}>
          {recipe.title}
        </Text>

        <View style={styles.metaContainer}>
          {recipe.readyInMinutes && (
            <>
              <View style={styles.metaItem}>
                <Image
                  source={require("@/assets/icons/clock-icon.svg")}
                  style={styles.metaIcon}
                />
                <Text style={styles.metaText}>
                  {recipe.readyInMinutes} mins
                </Text>
              </View>
            </>
          )}
          <Text style={styles.separator}>|</Text>

          {recipe.servings && (
            <View style={styles.metaItem}>
              <Image
                source={require("@/assets/icons/flame-icon.svg")}
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>{recipe.servings} servings</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: Colors.background.surface,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    height: 268,
  },
  itemImage: {
    width: "100%",
    aspectRatio: 10 / 9,
    backgroundColor: Colors.gray[300],
  },
  itemContentContainer: {
    flex: 1,
    padding: 12,
  },
  itemText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaIcon: {
    width: 12,
    height: 12,
  },
  separator: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});
