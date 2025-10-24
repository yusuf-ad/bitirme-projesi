import { Colors } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TabType = "discover" | "favorites";

interface TabHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabHeader({ activeTab, onTabChange }: TabHeaderProps) {
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
  activeTabText: {
    color: Colors.lilac[900],
    fontWeight: "bold",
  },
  inactiveTabText: {
    color: Colors.gray[500],
  },
});
