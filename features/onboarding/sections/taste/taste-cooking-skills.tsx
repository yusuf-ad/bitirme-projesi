import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface TasteCookingSkillsProps {
  title: string;
  description?: string;
  onSelectionChange?: (selectedSkill: string) => void;
  initialSelection?: string;
}

const cookingSkillOptions = [
  {
    id: "novice",
    level: 1,
    label: "Novice",
    emoji: "🍳",
    description: "I can cook eggs",
    subtitle: "Just starting out",
  },
  {
    id: "basic",
    level: 2,
    label: "Basic",
    emoji: "🥘",
    description: "I cook only simple recipes",
    subtitle: "Comfortable with basics",
  },
  {
    id: "intermediate",
    level: 3,
    label: "Intermediate",
    emoji: "👨‍🍳",
    description: "I regularly try new recipes",
    subtitle: "Experienced cook",
  },
  {
    id: "advanced",
    level: 4,
    label: "Advanced",
    emoji: "🍰",
    description: "I can cook any recipe",
    subtitle: "Expert in the kitchen",
  },
];

export function TasteCookingSkills({
  title,
  description,
  onSelectionChange,
  initialSelection = "",
}: TasteCookingSkillsProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>(initialSelection);

  const selectSkill = (skillId: string) => {
    setSelectedSkill(skillId);
    onSelectionChange?.(skillId);
  };

  const renderSkillCard = (skill: (typeof cookingSkillOptions)[0]) => {
    const isSelected = selectedSkill === skill.id;

    return (
      <Pressable
        key={skill.id}
        onPress={() => selectSkill(skill.id)}
        style={[styles.skillCard, isSelected && styles.skillCardSelected]}
      >
        {/* Background Progress Bars */}
        <View style={styles.progressBars}>
          {[1, 2, 3, 4].map((bar) => (
            <View
              key={bar}
              style={[
                styles.progressBar,
                bar <= skill.level && styles.progressBarFilled,
              ]}
            />
          ))}
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

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Emoji */}
          <Text style={styles.emoji}>{skill.emoji}</Text>

          {/* Title and Description */}
          <View style={styles.textSection}>
            <Text style={styles.skillLabel}>{skill.label}</Text>
            <Text style={styles.skillDescription}>{skill.description}</Text>
            <Text style={styles.skillSubtitle}>{skill.subtitle}</Text>
          </View>
        </View>

        {/* Gradient Overlay */}
        {isSelected && <View style={styles.cardGradient} />}
      </Pressable>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      {/* Skills Cards */}
      <View style={styles.cardsContainer}>
        {cookingSkillOptions.map((skill) => renderSkillCard(skill))}
      </View>

      {/* Selected Skill Details */}
      {selectedSkill && (
        <View style={styles.detailsBox}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Your Skill Level</Text>
            <View style={styles.badgeContainer}>
              {cookingSkillOptions
                .filter((s) => s.id === selectedSkill)
                .map((skill) => (
                  <View key={skill.id} style={styles.badge}>
                    <Text style={styles.badgeEmoji}>{skill.emoji}</Text>
                    <Text style={styles.badgeLabel}>{skill.label}</Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <MaterialCommunityIcons
              name="lightbulb-on"
              size={18}
              color="#548A6A"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.tipsText}>
              {selectedSkill === "novice" &&
                "Let's find simple, delicious recipes to build your confidence!"}
              {selectedSkill === "basic" &&
                "Great! We'll recommend easy-to-follow recipes with clear instructions."}
              {selectedSkill === "intermediate" &&
                "Perfect! You'll love our diverse recipe collection."}
              {selectedSkill === "advanced" &&
                "Amazing! We'll include gourmet and challenging recipes for you."}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 15,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 24,
    lineHeight: 29,
    color: "#22252B",
    marginBottom: 8,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19,
    color: "#444955",
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  skillCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E8E3ED",
    marginHorizontal: 15,
    overflow: "hidden",
  },
  skillCardSelected: {
    borderColor: "#548A6A",
    backgroundColor: "#F0F7F3",
  },
  progressBars: {
    position: "absolute",
    left: 0,
    top: 0,
    flexDirection: "row",
    height: "100%",
  },
  progressBar: {
    flex: 1,
    backgroundColor: "#E8E3ED",
  },
  progressBarFilled: {
    backgroundColor: "#D4EDE0",
  },
  selectionIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 1,
  },
  emoji: {
    fontSize: 32,
  },
  textSection: {
    flex: 1,
    gap: 4,
  },
  skillLabel: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 18,
    color: "#22252B",
  },
  skillDescription: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    color: "#548A6A",
  },
  skillSubtitle: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#737780",
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(84, 138, 106, 0.03)",
  },
  detailsBox: {
    marginHorizontal: 15,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F0F7F3",
    borderLeftWidth: 4,
    borderLeftColor: "#548A6A",
  },
  detailsHeader: {
    gap: 8,
    marginBottom: 12,
  },
  detailsTitle: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#548A6A",
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#548A6A",
    gap: 4,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeLabel: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 12,
    color: "#FFFFFF",
  },
  tipsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tipsText: {
    flex: 1,
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 18,
    color: "#22252B",
  },
  bottomPadding: {
    height: 20,
  },
});
