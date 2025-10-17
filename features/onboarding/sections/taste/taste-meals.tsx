import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface TasteMealsProps {
  title: string;
  description?: string;
  onSelectionChange?: (selectedMeals: string[]) => void;
  initialSelection?: string[];
}

const mealOptions = [
  {
    id: "breakfast",
    label: "Breakfast",
    description: "Morning meals",
    icon: "egg-fried",
    color: "#FFD93D",
  },
  {
    id: "lunch",
    label: "Lunch",
    description: "Midday meals",
    icon: "food-fork-drink",
    color: "#6BCF7F",
  },
  {
    id: "snack",
    label: "Snack",
    description: "Quick bites",
    icon: "food-apple",
    color: "#FF9F43",
  },
  {
    id: "dinner",
    label: "Dinner",
    description: "Evening meals",
    icon: "silverware-fork-knife",
    color: "#FF6B6B",
  },
];

export function TasteMeals({
  title,
  description,
  onSelectionChange,
  initialSelection = [],
}: TasteMealsProps) {
  const [selectedMeals, setSelectedMeals] =
    useState<string[]>(initialSelection);

  const toggleMeal = (mealId: string) => {
    const updatedSelection = selectedMeals.includes(mealId)
      ? selectedMeals.filter((m) => m !== mealId)
      : [...selectedMeals, mealId];

    setSelectedMeals(updatedSelection);
    onSelectionChange?.(updatedSelection);
  };

  const renderMealCard = (meal: (typeof mealOptions)[0]) => {
    const isSelected = selectedMeals.includes(meal.id);

    return (
      <Pressable
        key={meal.id}
        onPress={() => toggleMeal(meal.id)}
        style={[styles.mealCard, isSelected && styles.mealCardSelected]}
      >
        {/* Background Icon */}
        <View style={styles.iconBackgroundWrapper}>
          <View
            style={[
              styles.iconBackground,
              { backgroundColor: `${meal.color}20` },
            ]}
          >
            <MaterialCommunityIcons
              name={meal.icon as any}
              size={48}
              color={meal.color}
            />
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.cardContent}>
          <Text style={styles.mealLabel}>{meal.label}</Text>
          <Text style={styles.mealDescription}>{meal.description}</Text>
        </View>

        {/* Selection Indicator */}
        {isSelected && (
          <View style={styles.selectionIndicator}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="#548A6A"
            />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      {/* Meals Grid */}
      <View style={styles.cardsContainer}>
        {mealOptions.map((meal) => renderMealCard(meal))}
      </View>

      {/* Selection Summary */}
      {selectedMeals.length > 0 && (
        <View style={styles.summaryBox}>
          <View style={styles.summaryContent}>
            <MaterialCommunityIcons
              name="check-all"
              size={20}
              color="#548A6A"
            />
            <Text style={styles.summaryText}>
              {selectedMeals.length} meal{selectedMeals.length !== 1 ? "s" : ""}{" "}
              selected
            </Text>
          </View>
          <View style={styles.selectedMealsPreview}>
            {selectedMeals.map((mealId) => {
              const meal = mealOptions.find((m) => m.id === mealId);
              return (
                <View key={mealId} style={styles.previewTag}>
                  <Text style={styles.previewTagText}>{meal?.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 15,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 28,
    lineHeight: 34,
    color: "#22252B",
    marginBottom: 12,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 22,
    color: "#444955",
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 15,
  },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E8E3ED",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  mealCardSelected: {
    borderColor: "#548A6A",
    backgroundColor: "#F9FBFA",
  },
  iconBackgroundWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  mealLabel: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 18,
    color: "#22252B",
    marginBottom: 4,
  },
  mealDescription: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 13,
    color: "#737780",
  },
  selectionIndicator: {
    marginRight: 8,
  },
  chevronIcon: {
    marginLeft: "auto",
  },
  summaryBox: {
    marginHorizontal: 15,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F0F7F3",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#548A6A",
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  summaryText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#548A6A",
  },
  selectedMealsPreview: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  previewTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#548A6A",
    borderRadius: 8,
  },
  previewTagText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
    color: "#FFFFFF",
  },
  bottomPadding: {
    height: 20,
  },
});
