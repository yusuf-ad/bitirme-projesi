import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import Entypo from "@expo/vector-icons/Entypo";
import { memo } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

interface FilterChipsProps {
  filters: string[];
  selectedFilters: string[];
  onToggleFilter: (filter: string) => void;
  onAddIngredients?: () => void;
  onCuisinePress?: () => void;
  selectedIngredients?: string[];
  selectedCuisines?: string[];
  onTimePress?: () => void;
  selectedTimeLabel?: string;
  onCaloriePress?: () => void;
  selectedCalorieLabel?: string;
}

// Memoized filter chip
const FilterChip = memo(({
  filter,
  isSelected,
  onToggle,
}: {
  filter: string;
  isSelected: boolean;
  onToggle: (filter: string) => void;
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.filterChip,
      isSelected && styles.filterChipActive,
      pressed && styles.filterChipPressed,
    ]}
    onPress={() => onToggle(filter)}
  >
    <Text
      style={[
        styles.filterChipText,
        isSelected && styles.filterChipTextActive,
      ]}
    >
      {filter}
    </Text>
  </Pressable>
));

FilterChip.displayName = "FilterChip";

export function FilterChips({
  filters,
  selectedFilters,
  onToggleFilter,
  onAddIngredients,
  onCuisinePress,
  selectedIngredients = [],
  selectedCuisines = [],
  onTimePress,
  selectedTimeLabel,
  onCaloriePress,
  selectedCalorieLabel,
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

      {onCuisinePress && (
        <CustomButton
          containerStyle={[
            styles.addIngredientsButton,
            selectedCuisines.length > 0 && styles.addIngredientsButtonActive,
          ]}
          onPress={onCuisinePress}
        >
          <Text style={styles.addIngredientsText}>
            {getCuisineButtonText()}
          </Text>
          <Entypo name="chevron-down" size={20} color="black" />
        </CustomButton>
      )}

      {onTimePress && (
        <CustomButton
          containerStyle={[
            styles.addIngredientsButton,
            selectedTimeLabel && styles.addIngredientsButtonActive,
          ]}
          onPress={onTimePress}
        >
          <Text style={styles.addIngredientsText}>
            {selectedTimeLabel ?? "Total time"}
          </Text>
          <Entypo name="chevron-down" size={20} color="black" />
        </CustomButton>
      )}

      {onCaloriePress && (
        <CustomButton
          containerStyle={[
            styles.addIngredientsButton,
            selectedCalorieLabel && styles.addIngredientsButtonActive,
          ]}
          onPress={onCaloriePress}
        >
          <Text style={styles.addIngredientsText}>
            {selectedCalorieLabel ?? "Calories"}
          </Text>
          <Entypo name="chevron-down" size={20} color="black" />
        </CustomButton>
      )}

      {filters.map((filter) => (
        <FilterChip
          key={filter}
          filter={filter}
          isSelected={selectedFilters.includes(filter)}
          onToggle={onToggleFilter}
        />
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
    backgroundColor: "rgba(180, 156, 218, 0.15)",
    borderColor: Colors.lilac[700],
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
  filterChipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
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
