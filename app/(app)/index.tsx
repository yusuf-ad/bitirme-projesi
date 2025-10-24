import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
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
    <View style={[styles.mainContainer, { paddingTop: top }]}>
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottom + 52 * (Platform.OS === "ios" ? 1 : 2) },
        ]}
      >
        {/* Content */}
        {activeTab === "discover" && (
          <View style={styles.discoverContainer}>
            <View style={styles.gridContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
                <View key={item} style={styles.gridItem}>
                  <View style={styles.itemCard}>
                    <Image
                      source={{
                        uri: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZHxlbnwwfDJ8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900`,
                      }}
                      style={styles.itemImage}
                    />

                    <View style={styles.itemContentContainer}>
                      <Text style={styles.itemText}>Recipe {item}</Text>

                      <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                          <Image
                            source={require("@/assets/icons/clock-icon.svg")}
                            style={styles.metaIcon}
                          />
                          <Text style={styles.metaText}>10 mins</Text>
                        </View>
                        <Text style={styles.separator}>|</Text>
                        <View style={styles.metaItem}>
                          <Image
                            source={require("@/assets/icons/flame-icon.svg")}
                            style={styles.metaIcon}
                          />
                          <Text style={styles.metaText}>260 kcal</Text>
                        </View>
                      </View>
                    </View>
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
  scrollContent: {
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
    backgroundColor: Colors.background.surface,
    borderRadius: 12,
  },
  itemImage: {
    width: "100%",
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemContentContainer: {
    padding: 12,
    gap: 6,
  },
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray["800"],
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
  metaText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 24,
    color: Colors.gray[600],
  },
  separator: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 24,
    letterSpacing: -1,
    color: Colors.gray[600],
  },
});
