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
  const { bottom, top } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("discover");

  return (
    <ScrollView
      style={[styles.container, { paddingTop: top }]}
      showsVerticalScrollIndicator={false}
      // safe area boşluğu + tabbar yüksekliği
      contentContainerStyle={{
        paddingBottom: bottom + 52 * (Platform.OS === "ios" ? 1 : 2),
      }}
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

      {/* Content */}
      {activeTab === "discover" && (
        <View>{/* Discover content buraya gelecek */}</View>
      )}

      {activeTab === "favorites" && (
        <View>{/* Favorites content buraya gelecek */}</View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
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
