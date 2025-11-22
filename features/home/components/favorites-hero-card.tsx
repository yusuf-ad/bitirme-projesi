import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

interface FavoritesHeroCardProps {
  favoriteCount: number;
}

export function FavoritesHeroCard({ favoriteCount }: FavoritesHeroCardProps) {
  return (
    <LinearGradient
      colors={[Colors.lilac[900], Colors.lilac[700]]}
      style={styles.container}
    >
      <View style={styles.iconBadge}>
        <Ionicons name="heart" size={20} color={Colors.background.surface} />
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.eyebrow}>Your Inspiration Board</Text>
        <Text style={styles.title}>
          {favoriteCount > 0
            ? `${favoriteCount} recipes always at hand`
            : "Save recipes you love"}
        </Text>
        <Text style={styles.subtitle}>
          Recipes are collected here when you tap the heart icon. Adding
          favorites to your plans is now easier.
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
    color: Colors.background.surface,
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
