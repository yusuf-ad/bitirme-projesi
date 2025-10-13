import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface GoalsContentProps {
  title: string;
  description?: string;
  onSelectionChange?: (selectedGoals: string[]) => void;
  initialSelection?: string[];
}

const goalOptions = [
  {
    id: "healthy-eating",
    title: "Eat healthy",
    icon: require("@/assets/icons/carrot-icon.svg"),
  },
  {
    id: "learn-cooking",
    title: "Learn to cook",
    icon: require("@/assets/icons/chef-icon.svg"),
  },
  {
    id: "lose-weight",
    title: "Lose weight",
    icon: require("@/assets/icons/scale-icon.svg"),
  },
  {
    id: "gain-weight",
    title: "Gain weight",
    icon: require("@/assets/icons/weight-icon.svg"),
  },
  {
    id: "try-recipes",
    title: "Try new\nrecipes",
    icon: require("@/assets/icons/recipe-icon.svg"),
  },
  {
    id: "stay-on-diet",
    title: "Stick to\nyour diet",
    icon: require("@/assets/icons/diet-icon.svg"),
  },
  {
    id: "build-muscle",
    title: "Build muscle",
    icon: require("@/assets/icons/muscle-icon.svg"),
  },
  {
    id: "save-time",
    title: "Save\ntime",
    icon: require("@/assets/icons/time-icon.svg"),
  },
];

export function GoalsContent({
  title,
  description,
  onSelectionChange,
  initialSelection = ["healthy-eating"],
}: GoalsContentProps) {
  const [selectedGoals, setSelectedGoals] =
    useState<string[]>(initialSelection);

  function toggleGoal(goalId: string) {
    const newSelection = selectedGoals.includes(goalId)
      ? selectedGoals.filter((id) => id !== goalId)
      : [...selectedGoals, goalId];

    setSelectedGoals(newSelection);
    onSelectionChange?.(newSelection);
  }

  return (
    <View style={styles.content}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.optionsContainer}>
          {/* Row 1 */}
          <View style={styles.row}>
            <GoalOption
              option={goalOptions[0]}
              isSelected={selectedGoals.includes(goalOptions[0].id)}
              onPress={() => toggleGoal(goalOptions[0].id)}
            />
            <GoalOption
              option={goalOptions[1]}
              isSelected={selectedGoals.includes(goalOptions[1].id)}
              onPress={() => toggleGoal(goalOptions[1].id)}
            />
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            <GoalOption
              option={goalOptions[2]}
              isSelected={selectedGoals.includes(goalOptions[2].id)}
              onPress={() => toggleGoal(goalOptions[2].id)}
            />
            <GoalOption
              option={goalOptions[3]}
              isSelected={selectedGoals.includes(goalOptions[3].id)}
              onPress={() => toggleGoal(goalOptions[3].id)}
            />
          </View>

          {/* Row 3 */}
          <View style={styles.row}>
            <GoalOption
              option={goalOptions[4]}
              isSelected={selectedGoals.includes(goalOptions[4].id)}
              onPress={() => toggleGoal(goalOptions[4].id)}
            />
            <GoalOption
              option={goalOptions[5]}
              isSelected={selectedGoals.includes(goalOptions[5].id)}
              onPress={() => toggleGoal(goalOptions[5].id)}
            />
          </View>

          {/* Row 4 */}
          <View style={styles.row}>
            <GoalOption
              option={goalOptions[6]}
              isSelected={selectedGoals.includes(goalOptions[6].id)}
              onPress={() => toggleGoal(goalOptions[6].id)}
            />
            <GoalOption
              option={goalOptions[7]}
              isSelected={selectedGoals.includes(goalOptions[7].id)}
              onPress={() => toggleGoal(goalOptions[7].id)}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

interface GoalOptionProps {
  option: { id: string; title: string; icon: any };
  isSelected: boolean;
  onPress: () => void;
}

function GoalOption({ option, isSelected, onPress }: GoalOptionProps) {
  return (
    <Pressable
      style={[styles.option, isSelected && styles.optionSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      {isSelected && (
        <View style={styles.checkmarkBadge}>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={Colors.green[900]}
          />
        </View>
      )}

      <Text style={styles.optionText}>{option.title}</Text>
      <View style={styles.iconPlaceholder} />
      <View style={styles.iconContainer}>
        <Image source={option.icon} style={styles.icon} contentFit="contain" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: 27,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 27,
    marginTop: 42,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 32,
    lineHeight: 40,
    color: "#2D3142",
    marginBottom: 16,
    maxWidth: 344,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 24,
    color: "#5D6270",
    maxWidth: 317,
  },
  optionsContainer: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  option: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    minHeight: 140,
    justifyContent: "space-between",
    borderWidth: 3,
    borderColor: "transparent",
    position: "relative",
  },
  optionSelected: {
    borderColor: Colors.green[900],
  },
  optionText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 20,
    lineHeight: 24.2,
    color: "#000000",
  },
  iconPlaceholder: {
    flex: 1,
  },
  iconContainer: {
    alignSelf: "flex-end",
    width: 156,
    height: 54,
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  checkmarkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
});
