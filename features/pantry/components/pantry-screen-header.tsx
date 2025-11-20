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
}

export function PantryScreenHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  shoppingListCount = 0,
}: PantryScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Row: Title & Actions */}
      <View style={styles.topRow}>
        <Text style={styles.title}>My Pantry</Text>

        <View style={styles.actionsContainer}>
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
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color={Colors.gray[400]}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={
            activeTab === "my-ingredients"
              ? "Search ingredients..."
              : "Search recipes..."
          }
          placeholderTextColor={Colors.gray[400]}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "my-ingredients" && styles.activeTab,
          ]}
          onPress={() => onTabChange("my-ingredients")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "my-ingredients" && styles.activeTabText,
            ]}
          >
            My Ingredients
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "recipe-ideas" && styles.activeTab]}
          onPress={() => onTabChange("recipe-ideas")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "recipe-ideas" && styles.activeTabText,
            ]}
          >
            Recipe Ideas
          </Text>
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
    marginBottom: 24,
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
    marginBottom: 16,
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
});
