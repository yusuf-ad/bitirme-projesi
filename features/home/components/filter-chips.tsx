import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import Entypo from "@expo/vector-icons/Entypo";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

interface FilterChipsProps {
  filters: string[];
  selectedFilters: string[];
  onToggleFilter: (filter: string) => void;
  onAddIngredients?: () => void;
  onCuisinePress?: () => void;
  selectedIngredients?: string[];
  selectedCuisines?: string[];
}

export function FilterChips({
  filters,
  selectedFilters,
  onToggleFilter,
  onAddIngredients,
  onCuisinePress,
  selectedIngredients = [],
  selectedCuisines = [],
}: FilterChipsProps) {
  const getIngredientButtonText = () => {
    if (selectedIngredients.length === 0) return "Ingredients";
    if (selectedIngredients.length === 1) return selectedIngredients[0];
    return `${selectedIngredients.length} items`;
  };

  const getCuisineButtonText = () => {
    if (selectedCuisines.length === 0) return "Cuisine";
    if (selectedCuisines.length === 1) return selectedCuisines[0];
    return `${selectedCuisines.length} items`;
  };
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filtersScroll}
      contentContainerStyle={styles.filtersContent}
    >
      {onAddIngredients && (
        <CustomButton
          containerStyle={[
            styles.addIngredientsButton,
            selectedIngredients.length > 0 && styles.addIngredientsButtonActive,
          ]}
          onPress={onAddIngredients}
        >
          <Text style={styles.addIngredientsText}>
            {getIngredientButtonText()}
          </Text>
          <Entypo name="chevron-down" size={20} color="black" />
        </CustomButton>
      )}

      <CustomButton
        containerStyle={[
          styles.addIngredientsButton,
          selectedCuisines.length > 0 && styles.addIngredientsButtonActive,
        ]}
        onPress={onCuisinePress}
      >
        <Text style={styles.addIngredientsText}>{getCuisineButtonText()}</Text>
        <Entypo name="chevron-down" size={20} color="black" />
      </CustomButton>

      <Pressable style={styles.addIngredientsButton}>
        <Text style={styles.addIngredientsText}>Total time</Text>
        <Entypo name="chevron-down" size={20} color="black" />
      </Pressable>

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
    width: "auto",
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
  addIngredientsButtonActive: {
    backgroundColor: Colors.lilac[100],
    borderColor: Colors.lilac[500],
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
