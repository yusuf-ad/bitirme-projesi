import { Colors } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TabType = "discover" | "favorites";

interface HomeHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  favoriteCount?: number;
}

export function HomeHeader({
  activeTab,
  onTabChange,
  favoriteCount = 0,
}: HomeHeaderProps) {
  const formattedFavoriteCount =
    favoriteCount > 99 ? "99+" : favoriteCount.toString();

  return (
    <View style={styles.headerContainer}>
      <Pressable
        onPress={() => onTabChange("discover")}
        style={[
          styles.tabButton,
          activeTab === "discover"
            ? styles.tabButtonActive
            : styles.tabButtonInactive,
        ]}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "discover"
              ? styles.activeTabText
              : styles.inactiveTabText,
          ]}
        >
          Discover
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onTabChange("favorites")}
        style={[
          styles.tabButton,
          activeTab === "favorites"
            ? styles.tabButtonActive
            : styles.tabButtonInactive,
        ]}
      >
        <View style={styles.tabLabelContainer}>
          <Text
            style={[
              styles.tabText,
              activeTab === "favorites"
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}
          >
            Favorites
          </Text>

          {favoriteCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {formattedFavoriteCount}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    paddingTop: 12,
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.lilac[900],
  },
  tabButtonInactive: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[300],
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
  activeTabText: {
    color: Colors.lilac[900],
    fontWeight: "bold",
  },
  inactiveTabText: {
    color: Colors.gray[500],
  },
  countBadge: {
    minWidth: 24,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.lilac[100],
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    color: Colors.lilac[900],
    fontSize: 12,
    fontWeight: "600",
  },
});
