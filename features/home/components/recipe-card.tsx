import { Colors, getThemeColors } from "@/constants/theme";
import { Recipe } from "@/lib/spoonacular";
import { useTheme } from "@/providers/theme-provider";
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
  variant?: "default" | "chat";
}

export function RecipeCard({
  recipe,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  variant = "default",
}: RecipeCardProps) {
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);

  // Calorie bilgisini nutrition.nutrients array'inden çek
  const calories = recipe.nutrition?.nutrients?.find(
    (n) => n.name === "Calories"
  )?.amount;

  const isChat = variant === "chat";

  if (isChat) {
    console.log(`[RecipeCard Chat] Rendering: ${recipe.title}`, {
      readyInMinutes: recipe.readyInMinutes,
      calories: calories,
      nutritionDataExists: !!recipe.nutrition,
      nutritionKeys: recipe.nutrition ? Object.keys(recipe.nutrition) : [],
    });
  }

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

  // MIUI-style gradient colors for dark mode
  const gradientColors = isDark
    ? ([
        "rgba(191, 90, 242, 0.5)",
        "rgba(191, 90, 242, 0.3)",
        "rgba(191, 90, 242, 0.15)",
        "rgba(191, 90, 242, 0.05)",
      ] as const)
    : ([
        "rgba(120, 73, 182, 0.65)",
        "rgba(120, 73, 182, 0.45)",
        "rgba(120, 73, 182, 0.25)",
        "rgba(120, 73, 182, 0.08)",
      ] as const);

  return (
    <Pressable
      style={[styles.cardPressable, isChat && { width: 152 }]}
      onPress={onPress}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.gradientBorder, isChat && { height: 224 }]}
      >
        <View
          style={[
            styles.itemCard,
            {
              backgroundColor: isDark
                ? themeColors.card.backgroundElevated
                : themeColors.background.surface,
            },
          ]}
        >
          <View>
            <Image
              source={{ uri: recipe.image }}
              style={[styles.itemImage, isChat && { aspectRatio: 1 }]}
              placeholder="L4|400"
              contentFit="cover"
            />

            <Pressable
              hitSlop={24}
              style={[
                styles.favoriteButton,
                isFavorite && {
                  backgroundColor: themeColors.background.surface,
                },
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
                color={isFavorite ? "#F03E3E" : "#fff"}
              />
            </Pressable>
          </View>

          <View style={[styles.itemContentContainer, isChat && { padding: 8 }]}>
            <Text
              style={[
                styles.itemText,
                { color: themeColors.text.primary },
                isChat && { fontSize: 12, marginBottom: 4, lineHeight: 16 },
              ]}
              numberOfLines={2}
            >
              {recipe.title}
            </Text>

            <View
              style={[styles.metaContainer, isChat && { gap: 4, marginTop: 2 }]}
            >
              {recipe.readyInMinutes !== undefined && (
                <View style={styles.metaItem}>
                  <Image
                    source={require("@/assets/icons/clock-icon.svg")}
                    style={[
                      styles.metaIcon,
                      isChat && { width: 12, height: 12 },
                    ]}
                  />
                  <Text
                    style={[
                      styles.metaText,
                      { color: themeColors.text.secondary },
                      isChat && { fontSize: 11 },
                    ]}
                  >
                    {recipe.readyInMinutes}
                    {isChat ? "m" : " mins"}
                  </Text>
                </View>
              )}

              {recipe.readyInMinutes !== undefined &&
                calories !== undefined && (
                  <Text
                    style={[
                      styles.separator,
                      { color: themeColors.text.secondary },
                      isChat && { fontSize: 10 },
                    ]}
                  >
                    |
                  </Text>
                )}

              {calories !== undefined && (
                <View style={styles.metaItem}>
                  <Image
                    source={require("@/assets/icons/flame-icon.svg")}
                    style={[
                      styles.metaIcon,
                      isChat && { width: 12, height: 12 },
                    ]}
                  />
                  <Text
                    style={[
                      styles.metaText,
                      { color: themeColors.text.secondary },
                      isChat && { fontSize: 11 },
                    ]}
                  >
                    {Math.round(calories)} {isChat ? "cal" : "cal"}
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
    height: 252,
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
  },
  metaText: {
    fontSize: 12,
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
