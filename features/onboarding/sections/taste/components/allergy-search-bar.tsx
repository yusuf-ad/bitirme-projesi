import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import type { AllergyThemeColors } from "../types";

interface AllergySearchBarProps {
  searchQuery: string;
  isSearching: boolean;
  onChangeText: (text: string) => void;
  onClear: () => void;
  colors: AllergyThemeColors;
}

export function AllergySearchBar({
  searchQuery,
  isSearching,
  onChangeText,
  onClear,
  colors,
}: AllergySearchBarProps) {
  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.surface }]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={colors.text.secondary}
      />
      <TextInput
        style={[styles.input, { color: colors.text.primary }]}
        placeholder="Search ingredients..."
        placeholderTextColor={colors.text.secondary}
        value={searchQuery}
        onChangeText={onChangeText}
      />
      {isSearching && (
        <ActivityIndicator size="small" color={colors.lilac[900]} />
      )}
      {searchQuery.length > 0 && !isSearching && (
        <Pressable onPress={onClear}>
          <MaterialCommunityIcons
            name="close-circle"
            size={20}
            color={colors.text.secondary}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
});

