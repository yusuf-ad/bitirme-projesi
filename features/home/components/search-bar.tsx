import { Colors, getThemeColors } from "@/constants/theme";
import { useFilterStore } from "@/lib/stores/filter-store";
import { useTheme } from "@/providers/theme-provider";
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
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[500];

  useEffect(() => {
    console.log(
      "📍 Selected Ingredients:",
      selectedIngredients.map((ing) => ing.name)
    );
    console.log("🍲 Selected Cuisines:", selectedCuisines);
  }, [selectedIngredients, selectedCuisines]);

  return (
    <View style={styles.searchBarRow}>
      <View style={[
        styles.searchBar,
        { 
          backgroundColor: themeColors.background.surface,
          borderColor: themeColors.border.light,
        }
      ]}>
        <Ionicons
          name="search"
          size={20}
          color={accentColor}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: themeColors.text.primary }]}
          placeholder="Search recipes..."
          placeholderTextColor={themeColors.text.tertiary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {isSearching && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <ActivityIndicator size="small" color={accentColor} />
          </Animated.View>
        )}
        {searchQuery.length > 0 && !isSearching && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Pressable
              onPress={() => onSearchChange("")}
              style={styles.clearButton}
            >
              <AntDesign name="close-circle" size={18} color={themeColors.text.tertiary} />
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
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 2,
    borderWidth: 1,
  },
  filterButton: {
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
  },
  clearButton: {
    padding: 4,
  },
});


