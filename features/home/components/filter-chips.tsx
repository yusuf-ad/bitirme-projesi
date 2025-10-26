import { Colors } from "@/constants/theme";
import Entypo from "@expo/vector-icons/Entypo";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

interface FilterChipsProps {
  filters: string[];
  selectedFilters: string[];
  onToggleFilter: (filter: string) => void;
  onAddIngredients?: () => void;
}

export function FilterChips({
  filters,
  selectedFilters,
  onToggleFilter,
  onAddIngredients,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filtersScroll}
      contentContainerStyle={styles.filtersContent}
    >
      {onAddIngredients && (
        <Pressable
          style={styles.addIngredientsButton}
          onPress={onAddIngredients}
        >
          <Text style={styles.addIngredientsText}>Ingredients</Text>
          <Entypo name="chevron-down" size={20} color="black" />
        </Pressable>
      )}
      {filters.map((filter) => (
        <Pressable
          key={filter}
          style={[
            styles.filterChip,
            selectedFilters.includes(filter) && styles.filterChipActive,
          ]}
          onPress={() => onToggleFilter(filter)}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilters.includes(filter) && styles.filterChipTextActive,
            ]}
          >
            {filter}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filtersScroll: {
    flexGrow: 0,
  },
  filtersContent: {
    gap: 8,
    paddingRight: 16,
    paddingVertical: 8,
  },
  addIngredientsButton: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.lilac[200],

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addIngredientsText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  filterChip: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  filterChipActive: {
    backgroundColor: Colors.lilac[900],
    borderColor: Colors.lilac[900],
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  filterChipTextActive: {
    color: "white",
    fontWeight: "600",
  },
});
