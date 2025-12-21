import { Colors, getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
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

// Memoized filter chip with theme support
const FilterChipComponent = ({
  filter,
  isSelected,
  onToggle,
  isDark,
  themeColors,
  accentColor,
}: {
  filter: string;
  isSelected: boolean;
  onToggle: (filter: string) => void;
  isDark: boolean;
  themeColors: ReturnType<typeof getThemeColors>;
  accentColor: string;
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.filterChip,
      { 
        backgroundColor: themeColors.background.surface,
        borderColor: themeColors.border.light,
      },
      isSelected && { backgroundColor: accentColor, borderColor: accentColor },
      pressed && styles.filterChipPressed,
    ]}
    onPress={() => onToggle(filter)}
  >
    <Text
      style={[
        styles.filterChipText,
        { color: themeColors.text.primary },
        isSelected && styles.filterChipTextActive,
      ]}
    >
      {filter}
    </Text>
  </Pressable>
);

const FilterChip = memo(FilterChipComponent);
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
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[900];
  const chevronColor = isDark ? themeColors.text.primary : "black";

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

  const buttonStyle = {
    backgroundColor: themeColors.background.surface,
    borderColor: themeColors.border.light,
  };

  const activeButtonStyle = {
    backgroundColor: isDark ? "rgba(191, 90, 242, 0.2)" : "rgba(180, 156, 218, 0.15)",
    borderColor: accentColor,
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
            buttonStyle,
            selectedIngredients.length > 0 && activeButtonStyle,
          ]}
          onPress={onAddIngredients}
        >
          <Text style={[styles.addIngredientsText, { color: themeColors.text.primary }]}>
            {getIngredientButtonText()}
          </Text>
          <Entypo name="chevron-down" size={20} color={chevronColor} />
        </CustomButton>
      )}

      {onCuisinePress && (
        <CustomButton
          containerStyle={[
            styles.addIngredientsButton,
            buttonStyle,
            selectedCuisines.length > 0 && activeButtonStyle,
          ]}
          onPress={onCuisinePress}
        >
          <Text style={[styles.addIngredientsText, { color: themeColors.text.primary }]}>
            {getCuisineButtonText()}
          </Text>
          <Entypo name="chevron-down" size={20} color={chevronColor} />
        </CustomButton>
      )}

      {onTimePress && (
        <CustomButton
          containerStyle={[
            styles.addIngredientsButton,
            buttonStyle,
            selectedTimeLabel && activeButtonStyle,
          ]}
          onPress={onTimePress}
        >
          <Text style={[styles.addIngredientsText, { color: themeColors.text.primary }]}>
            {selectedTimeLabel ?? "Total time"}
          </Text>
          <Entypo name="chevron-down" size={20} color={chevronColor} />
        </CustomButton>
      )}

      {onCaloriePress && (
        <CustomButton
          containerStyle={[
            styles.addIngredientsButton,
            buttonStyle,
            selectedCalorieLabel && activeButtonStyle,
          ]}
          onPress={onCaloriePress}
        >
          <Text style={[styles.addIngredientsText, { color: themeColors.text.primary }]}>
            {selectedCalorieLabel ?? "Calories"}
          </Text>
          <Entypo name="chevron-down" size={20} color={chevronColor} />
        </CustomButton>
      )}

      {filters.map((filter) => (
        <FilterChip
          key={filter}
          filter={filter}
          isSelected={selectedFilters.includes(filter)}
          onToggle={onToggleFilter}
          isDark={isDark}
          themeColors={themeColors}
          accentColor={accentColor}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addIngredientsText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1,
  },
  filterChipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  filterChipText: {
    fontSize: 14,
  },
  filterChipTextActive: {
    color: "white",
    fontWeight: "600",
  },
});

