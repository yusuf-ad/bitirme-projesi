import { Colors } from "@/constants/theme";
import { useFilterStore } from "@/lib/stores/filter-store";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useEffect } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterPress: () => void;
  isSearching?: boolean;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  onFilterPress,
  isSearching = false,
}: SearchBarProps) {
  const { selectedIngredients, selectedCuisines } = useFilterStore();

  useEffect(() => {
    console.log(
      "📍 Selected Ingredients:",
      selectedIngredients.map((ing) => ing.name)
    );
    console.log("🍲 Selected Cuisines:", selectedCuisines);
  }, [selectedIngredients, selectedCuisines]);

  return (
    <View style={styles.searchBarRow}>
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={20}
          color={Colors.lilac[500]}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          placeholderTextColor={Colors.gray[400]}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {isSearching && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <ActivityIndicator size="small" color={Colors.lilac[500]} />
          </Animated.View>
        )}
        {searchQuery.length > 0 && !isSearching && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Pressable
              onPress={() => onSearchChange("")}
              style={styles.clearButton}
            >
              <AntDesign name="close-circle" size={18} color={Colors.gray[400]} />
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 2,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  filterButton: {
    backgroundColor: Colors.lilac[900],
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },
  clearButton: {
    padding: 4,
  },
});

