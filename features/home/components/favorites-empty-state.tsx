import { Colors, getThemeColors } from "@/constants/theme";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/providers/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface FavoritesEmptyStateProps {
  onExplore: () => void;
}

export function FavoritesEmptyState({ onExplore }: FavoritesEmptyStateProps) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  
  const handleExplorePress = async () => {
    await Haptics.selectionAsync();
    onExplore();
  };

  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[900];

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: themeColors.background.surface,
        borderColor: isDark ? themeColors.border.light : Colors.lilac[200],
      }
    ]}>
      <View style={[
        styles.iconWrapper, 
        { backgroundColor: isDark ? "rgba(191, 90, 242, 0.2)" : Colors.lilac[100] }
      ]}>
        <Ionicons name="heart-outline" size={32} color={accentColor} />
      </View>

      <Text style={[styles.title, { color: themeColors.text.primary }]}>{t("recipes.noFavorites")}</Text>
      <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
        {t("recipes.noFavoritesDesc")}
      </Text>

      <Pressable
        onPress={handleExplorePress}
        style={[styles.ctaButton, { backgroundColor: accentColor }]}
        android_ripple={{ color: Colors.lilac[700] }}
        accessibilityRole="button"
        accessibilityLabel={t("recipes.returnToDiscover")}
      >
        <Text style={styles.ctaText}>{t("recipes.returnToDiscover")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    gap: 12,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  ctaButton: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
  },
  ctaText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});


