import { Colors } from "@/constants/theme";
import { Recipe } from "@/lib/spoonacular";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  // Calorie bilgisini nutrition.nutrients array'inden çek
  const calories = recipe.nutrition?.nutrients?.find(
    (n) => n.name === "Calories"
  )?.amount;

  return (
    <Pressable style={styles.itemCard} onPress={onPress}>
      <View>
        <Image
          source={{ uri: recipe.image }}
          style={styles.itemImage}
          placeholder="L4|400"
          contentFit="cover"
        />

        <Pressable hitSlop={24} style={styles.favoriteButton}>
          <Feather name="heart" size={20} color="white" />
        </Pressable>
      </View>

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

          {calories && (
            <View style={styles.metaItem}>
              <Image
                source={require("@/assets/icons/flame-icon.svg")}
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>{Math.round(calories)} cal</Text>
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 99,
    height: 32,
    width: 32,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
});
