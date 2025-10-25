import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterPress: () => void;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  onFilterPress,
}: SearchBarProps) {
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
      </View>
      <Pressable style={styles.filterButton} onPress={onFilterPress}>
        <Ionicons name="options-outline" size={20} color="white" />
      </Pressable>
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
    paddingVertical: Platform.OS === "ios" ? 12 : 2,
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
});
