import { getThemeColors } from "@/constants/theme";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/providers/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

interface FavoritesHeroCardProps {
  favoriteCount: number;
}

export function FavoritesHeroCard({ favoriteCount }: FavoritesHeroCardProps) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark, true);
  
  const gradientColors = isDark
    ? [Colors.accent.lilac, "#9B4DCA"] as const
    : [Colors.lilac[900], Colors.lilac[700]] as const;
  
  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
    >
      <View style={styles.iconBadge}>
        <Ionicons name="heart" size={20} color="#FFFFFF" />
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.eyebrow}>{t("recipes.inspirationBoard")}</Text>
        <Text style={styles.title}>
          {favoriteCount > 0
            ? `${favoriteCount} ${t("recipes.recipesAtHand")}`
            : t("recipes.saveRecipesYouLove")}
        </Text>
        <Text style={styles.subtitle}>
          {t("recipes.heroSubtitle")}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  iconBadge: {
    backgroundColor: "rgba(255,255,255,0.16)",
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrapper: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
  },
});

