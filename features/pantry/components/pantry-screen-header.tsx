import { Colors } from "@/constants/theme";
import { TabType } from "@/features/pantry";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PantryScreenHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  shoppingListCount?: number;
  ingredientsCount?: number;
  recipeIdeasCount?: number;
  onClear?: () => void;
}

export function PantryScreenHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  shoppingListCount = 0,
  ingredientsCount = 0,
  recipeIdeasCount = 0,
  onClear,
}: PantryScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Row: Title & Actions */}
      <View style={styles.topRow}>
        <Text style={styles.title}>My Pantry</Text>

        <View style={styles.actionsContainer}>
          {activeTab === "my-ingredients" &&
            ingredientsCount > 0 &&
            onClear && (
              <Pressable
                style={[styles.pillButton, styles.clearButton]}
                onPress={onClear}
              >
                <Feather
                  name="trash-2"
                  size={16}
                  color={Colors.semantic.error.main}
                />
              </Pressable>
            )}
          <Pressable
            style={[styles.pillButton, styles.cartButton]}
            onPress={() => router.push("/shopping-list")}
          >
            <Feather name="shopping-cart" size={16} color="#FFFFFF" />
            <Text style={styles.cartText}>{shoppingListCount}</Text>
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      {activeTab === "my-ingredients" && (
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color={Colors.gray[400]}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ingredients..."
            placeholderTextColor={Colors.gray[400]}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "my-ingredients" && styles.activeTab,
          ]}
          onPress={() => onTabChange("my-ingredients")}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                activeTab === "my-ingredients" && styles.activeTabText,
              ]}
            >
              My Ingredients
            </Text>
            {ingredientsCount > 0 && (
              <View
                style={[
                  styles.badge,
                  activeTab === "my-ingredients" && styles.activeBadge,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    activeTab === "my-ingredients" && styles.activeBadgeText,
                  ]}
                >
                  {ingredientsCount}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "recipe-ideas" && styles.activeTab]}
          onPress={() => onTabChange("recipe-ideas")}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                activeTab === "recipe-ideas" && styles.activeTabText,
              ]}
            >
              Recipe Ideas
            </Text>
            {recipeIdeasCount > 0 && (
              <View
                style={[
                  styles.badge,
                  activeTab === "recipe-ideas" && styles.activeBadge,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    activeTab === "recipe-ideas" && styles.activeBadgeText,
                  ]}
                >
                  {recipeIdeasCount > 99 ? "99+" : recipeIdeasCount}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
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
  clearButton: {
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.lilac[300],
  },
  cartButton: {
    backgroundColor: Colors.lilac[900],
  },
  cartText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
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
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Colors.lilac[900],
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[400],
  },
  activeTabText: {
    color: Colors.lilac[900],
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.gray[200],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: Colors.lilac[900],
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.gray[600],
  },
  activeBadgeText: {
    color: "#FFFFFF",
  },
});
