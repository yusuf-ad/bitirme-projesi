import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabType } from "../types";

interface PantryScreenHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  pantryCount?: number;
  shoppingListCount?: number;
}

export function PantryScreenHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  pantryCount = 0,
  shoppingListCount = 0,
}: PantryScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Row: Title & Actions */}
      <View style={styles.topRow}>
        <Text style={styles.title}>My Pantry</Text>

        <View style={styles.actionsContainer}>
          <Pressable style={[styles.pillButton, styles.bookmarkButton]}>
            <Feather name="bookmark" size={16} color={Colors.text.primary} />
            <Text style={styles.bookmarkText}>8</Text>
          </Pressable>
          <Pressable style={[styles.pillButton, styles.cartButton]}>
            <Feather name="shopping-cart" size={16} color="#FFFFFF" />
            <Text style={styles.cartText}>43</Text>
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color={Colors.gray[400]}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your pantry"
          placeholderTextColor={Colors.gray[400]}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          onPress={() => onTabChange("pantry")}
          style={[
            styles.tabItem,
            activeTab === "pantry" && styles.activeTabItem,
          ]}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                activeTab === "pantry" && styles.activeTabText,
              ]}
            >
              My Ingredients
            </Text>
            <View
              style={[
                styles.badge,
                activeTab === "pantry"
                  ? styles.activeBadge
                  : styles.inactiveBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  activeTab === "pantry"
                    ? styles.activeBadgeText
                    : styles.inactiveBadgeText,
                ]}
              >
                {pantryCount}
              </Text>
            </View>
          </View>
          {activeTab === "pantry" && <View style={styles.activeIndicator} />}
        </Pressable>

        <Pressable
          onPress={() => onTabChange("groceries")}
          style={[
            styles.tabItem,
            activeTab === "groceries" && styles.activeTabItem,
          ]}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                activeTab === "groceries" && styles.activeTabText,
              ]}
            >
              Recipe Ideas
            </Text>
            <View
              style={[
                styles.badge,
                activeTab === "groceries"
                  ? styles.activeBadge
                  : styles.inactiveBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  activeTab === "groceries"
                    ? styles.activeBadgeText
                    : styles.inactiveBadgeText,
                ]}
              >
                {shoppingListCount}
              </Text>
            </View>
          </View>
          {activeTab === "groceries" && <View style={styles.activeIndicator} />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  // Removed profileContainer and profileImage styles
  actionsContainer: {
    flexDirection: "row",
    gap: 6,
  },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
  },
  bookmarkButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.text.primary,
  },
  cartButton: {
    backgroundColor: "#0F172A", // Dark blue/black color
  },
  bookmarkText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  cartText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A", // Dark blue/black color
    // marginBottom removed since it's now in the top row
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[200],
  },
  tabItem: {
    paddingBottom: 12,
    position: "relative",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabItem: {
    // No background change, just text color and indicator
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[400],
  },
  activeTabText: {
    color: "#0F172A", // Active color
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1, // Overlap the border
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#0F172A",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBadge: {
    backgroundColor: "#0F172A",
  },
  inactiveBadge: {
    backgroundColor: Colors.gray[200],
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  activeBadgeText: {
    color: "#FFFFFF",
  },
  inactiveBadgeText: {
    color: Colors.gray[600],
  },
});
