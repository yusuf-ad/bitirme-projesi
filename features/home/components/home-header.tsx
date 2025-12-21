import { getThemeColors } from "@/constants/theme";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/providers/theme-provider";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

type TabType = "discover" | "favorites";

interface HomeHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  favoriteCount?: number;
  indicatorTranslateX?: Animated.AnimatedInterpolation<number>;
  tabWidth?: number;
}

export function HomeHeader({
  activeTab,
  onTabChange,
  favoriteCount = 0,
  indicatorTranslateX,
  tabWidth,
}: HomeHeaderProps) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark, true);
  
  const formattedFavoriteCount =
    favoriteCount > 99 ? "99+" : favoriteCount.toString();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.tabsWrapper}>
        <Pressable
          onPress={() => onTabChange("discover")}
          style={styles.tabButton}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "discover"
                ? { color: isDark ? Colors.accent.lilac : Colors.lilac[900], fontWeight: "bold" }
                : { color: Colors.text.tertiary },
            ]}
          >
            {t("recipes.discover")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onTabChange("favorites")}
          style={styles.tabButton}
        >
          <View style={styles.tabLabelContainer}>
            <Text
              style={[
                styles.tabText,
                activeTab === "favorites"
                  ? { color: isDark ? Colors.accent.lilac : Colors.lilac[900], fontWeight: "bold" }
                  : { color: Colors.text.tertiary },
              ]}
            >
              {t("recipes.favorites")}
            </Text>

            {favoriteCount > 0 && (
              <View style={[styles.countBadge, { backgroundColor: isDark ? "rgba(191, 90, 242, 0.2)" : Colors.lilac[100] }]}>
                <Text style={[styles.countBadgeText, { color: isDark ? Colors.accent.lilac : Colors.lilac[900] }]}>
                  {formattedFavoriteCount}
                </Text>
              </View>
            )}
          </View>
        </Pressable>

        {/* Animated indicator */}
        {indicatorTranslateX && tabWidth && (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: tabWidth,
                transform: [{ translateX: indicatorTranslateX }],
                backgroundColor: isDark ? Colors.accent.lilac : Colors.lilac[900],
              },
            ]}
          />
        )}
      </View>

      {/* Bottom border */}
      <View style={[styles.bottomBorder, { backgroundColor: Colors.border.light }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    flexDirection: "column",
  },
  tabsWrapper: {
    flexDirection: "row",
    position: "relative",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  tabText: {
    textAlign: "center",
  },
  tabLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  countBadge: {
    minWidth: 24,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 3,
    borderRadius: 1.5,
  },
  bottomBorder: {
    height: 1,
  },
});

