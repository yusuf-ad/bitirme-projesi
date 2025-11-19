import { Colors } from "@/constants/theme";
import { Recipe } from "@/lib/spoonacular";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (recipe: Recipe) => void;
}

export function RecipeCard({
  recipe,
  onPress,
  isFavorite = false,
  onToggleFavorite,
}: RecipeCardProps) {
  // Calorie bilgisini nutrition.nutrients array'inden çek
  const calories = recipe.nutrition?.nutrients?.find(
    (n) => n.name === "Calories"
  )?.amount;

  const handleToggleFavorite = async (
    event: GestureResponderEvent
  ): Promise<void> => {
    event.stopPropagation();

    if (!onToggleFavorite) {
      return;
    }

    await Haptics.selectionAsync();
    onToggleFavorite(recipe);
  };

  return (
    <Pressable style={styles.cardPressable} onPress={onPress}>
      <LinearGradient
        colors={[
          "rgba(120, 73, 182, 0.65)",
          "rgba(120, 73, 182, 0.45)",
          "rgba(120, 73, 182, 0.25)",
          "rgba(120, 73, 182, 0.08)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.itemCard}>
          <View>
            <Image
              source={{ uri: recipe.image }}
              style={styles.itemImage}
              placeholder="L4|400"
              contentFit="cover"
            />

            <Pressable
              hitSlop={24}
              style={[
                styles.favoriteButton,
                isFavorite && styles.favoriteActive,
              ]}
              onPress={handleToggleFavorite}
              android_ripple={{ color: Colors.lilac[300] }}
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"
              }
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={
                  isFavorite ? Colors.lilac[600] : Colors.background.surface
                }
              />
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
                  <Text style={styles.metaText}>
                    {Math.round(calories)} cal
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardPressable: {
    width: "100%",
  },
  gradientBorder: {
    borderRadius: 18,
    padding: 2.5,
    height: 272,
    shadowColor: Colors.lilac[900],
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  itemCard: {
    flex: 1,
    backgroundColor: Colors.background.surface,
    borderRadius: 15.5,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    borderTopLeftRadius: 15.5,
    borderTopRightRadius: 15.5,
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
  favoriteActive: {
    backgroundColor: Colors.background.surface,
  },
});
