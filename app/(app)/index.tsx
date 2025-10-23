import { Colors } from "@/constants/theme";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabType = "discover" | "favorites";

export default function HomeTab() {
  const { top, bottom } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("discover");

  return (
    <View
      style={[
        styles.mainContainer,
        {
          paddingTop: top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Pressable
          onPress={() => setActiveTab("discover")}
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
          onPress={() => setActiveTab("favorites")}
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

      {/* Content - Scrollable */}
      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: bottom + 52 * (Platform.OS === "ios" ? 1 : 2),
        }}
      >
        {/* Content */}
        {activeTab === "discover" && (
          <View style={styles.discoverContainer}>
            <View style={styles.gridContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
                <View key={item} style={styles.gridItem}>
                  <View style={styles.itemCard}>
                    <Text style={styles.itemText}>Item {item}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === "favorites" && (
          <View>{/* Favorites content buraya gelecek */}</View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  contentScroll: {
    flex: 1,
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
  discoverContainer: {
    marginTop: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
  },
  itemCard: {
    backgroundColor: Colors.lilac[400],
    borderRadius: 12,
    padding: 16,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.lilac[900],
  },
});
