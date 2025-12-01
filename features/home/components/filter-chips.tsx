import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import Entypo from "@expo/vector-icons/Entypo";
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import Animated, {
  Layout,
  SlideInRight,
} from "react-native-reanimated";

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
}

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
}: FilterChipsProps) {
  const prevSelectedFiltersRef = useRef<string[]>([]);
  const newlyAddedFiltersRef = useRef<Set<string>>(new Set());

  // Track newly added filters for animation
  useEffect(() => {
    const prevSelected = prevSelectedFiltersRef.current;
    const newlyAdded = new Set<string>();
    
    // Find filters that are now selected but weren't before
    selectedFilters.forEach(filter => {
      if (!prevSelected.includes(filter)) {
        newlyAdded.add(filter);
      }
    });
    
    newlyAddedFiltersRef.current = newlyAdded;
    prevSelectedFiltersRef.current = [...selectedFilters];
  }, [selectedFilters]);
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

      {filters.map((filter) => {
        const isSelected = selectedFilters.includes(filter);
        const isNewlyAdded = newlyAddedFiltersRef.current.has(filter);
        
        return (
          <Animated.View
            key={`${filter}-${isNewlyAdded ? 'new' : 'existing'}`}
            entering={isNewlyAdded ? SlideInRight.springify() : undefined}
            layout={Layout.springify()}
          >
            <Pressable
              style={[
                styles.filterChip,
                isSelected && styles.filterChipActive,
              ]}
              onPress={() => onToggleFilter(filter)}
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
          </Animated.View>
        );
      })}
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
    backgroundColor: "rgba(180, 156, 218, 0.15)", // Çok hafif mor arka plan
    borderColor: Colors.lilac[700], // Daha belirgin mor border
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
