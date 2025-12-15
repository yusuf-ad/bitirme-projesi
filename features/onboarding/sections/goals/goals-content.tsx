import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface GoalsContentProps {
  title: string;
  description?: string;
  onSelectionChange?: (selectedGoals: string[]) => void;
  initialSelection?: string[];
}

export const goalOptions = [
  {
    id: "healthy-eating",
    title: "Eat healthy",
    description: "Balanced meals for better health",
    emoji: "🥗",
    gradient: ["#E8F5E9", "#C8E6C9"],
  },
  {
    id: "learn-cooking",
    title: "Learn to cook",
    description: "Master new cooking skills",
    emoji: "👨‍🍳",
    gradient: ["#FFF3E0", "#FFE0B2"],
  },
  {
    id: "lose-weight",
    title: "Lose weight",
    description: "Calorie-controlled recipes",
    emoji: "⚖️",
    gradient: ["#E3F2FD", "#BBDEFB"],
  },
  {
    id: "gain-weight",
    title: "Gain weight",
    description: "High-calorie nutritious meals",
    emoji: "💪",
    gradient: ["#FCE4EC", "#F8BBD9"],
  },
  {
    id: "try-recipes",
    title: "Try new recipes",
    description: "Explore diverse cuisines",
    emoji: "📖",
    gradient: ["#F3E5F5", "#E1BEE7"],
  },
  {
    id: "stay-on-diet",
    title: "Stick to diet",
    description: "Stay consistent with your plan",
    emoji: "🎯",
    gradient: ["#E0F7FA", "#B2EBF2"],
  },
  {
    id: "build-muscle",
    title: "Build muscle",
    description: "Protein-rich meal plans",
    emoji: "🏋️",
    gradient: ["#FFEBEE", "#FFCDD2"],
  },
  {
    id: "save-time",
    title: "Save time",
    description: "Quick & easy recipes",
    emoji: "⏰",
    gradient: ["#FFFDE7", "#FFF9C4"],
  },
];

// Define conflicting goals that cannot be selected together
export const conflictingGoals: Record<string, string[]> = {
  "lose-weight": ["gain-weight"],
  "gain-weight": ["lose-weight"],
};

export function GoalsContent({
  title,
  description,
  onSelectionChange,
  initialSelection = ["healthy-eating"],
}: GoalsContentProps) {
  const [selectedGoals, setSelectedGoals] =
    useState<string[]>(initialSelection);

  function toggleGoal(goalId: string) {
    let newSelection: string[];

    if (selectedGoals.includes(goalId)) {
      newSelection = selectedGoals.filter((id) => id !== goalId);
    } else {
      const conflictingGoalIds = conflictingGoals[goalId] || [];
      newSelection = [
        ...selectedGoals.filter((id) => !conflictingGoalIds.includes(id)),
        goalId,
      ];
    }

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
  option: {
    id: string;
    title: string;
    description: string;
    emoji: string;
    gradient: string[];
  };
  isSelected: boolean;
  onPress: () => void;
}

function GoalOption({ option, isSelected, onPress }: GoalOptionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.optionWrapper,
        pressed && styles.optionPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <LinearGradient
        colors={option.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.option, isSelected && styles.optionSelected]}
      >
        {/* Selection indicator */}
        {isSelected && (
          <View style={styles.checkmarkBadge}>
            <View style={styles.checkmarkInner}>
              <Ionicons
                name="checkmark"
                size={14}
                color="#FFFFFF"
              />
            </View>
          </View>
        )}

        {/* Content */}
        <View style={styles.contentWrapper}>
          <View style={styles.textWrapper}>
            <Text
              style={[styles.optionText, isSelected && styles.optionTextSelected]}
              numberOfLines={2}
            >
              {option.title}
            </Text>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {option.description}
            </Text>
          </View>

          {/* Emoji Icon */}
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{option.emoji}</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: 24,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 32,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 28,
    lineHeight: 36,
    color: "#1A1D26",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    maxWidth: 300,
  },
  optionsContainer: {
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  optionWrapper: {
    flex: 1,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  optionPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  option: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    minHeight: 130,
    borderWidth: 2.5,
    borderColor: "transparent",
    overflow: "hidden",
  },
  optionSelected: {
    borderColor: Colors.green[600],
    shadowColor: Colors.green[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "space-between",
  },
  textWrapper: {
    flex: 1,
  },
  optionText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 20,
    color: "#1A1D26",
    marginBottom: 4,
  },
  optionTextSelected: {
    color: Colors.green[800],
  },
  descriptionText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 11,
    lineHeight: 15,
    color: "#6B7280",
    opacity: 0.85,
  },
  emojiContainer: {
    alignSelf: "flex-end",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 28,
  },
  checkmarkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  checkmarkInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.green[600],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.green[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});
