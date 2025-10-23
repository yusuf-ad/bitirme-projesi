import { Colors } from "@/constants/theme";
import { useOnboarding } from "@/providers/onboarding-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COOKING_SKILLS = [
  {
    id: "novice",
    emoji: "🍳",
    label: "Novice",
    description: "Just starting out in the kitchen",
  },
  {
    id: "basic",
    emoji: "🥘",
    label: "Basic",
    description: "Can make simple meals",
  },
  {
    id: "intermediate",
    emoji: "👨‍🍳",
    label: "Intermediate",
    description: "Comfortable with various techniques",
  },
  {
    id: "advanced",
    emoji: "🍰",
    label: "Advanced",
    description: "Experienced home chef",
  },
];

export default function CookingSkillScreen() {
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (onboarding.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.lilac[900]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Cooking Skill</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 20 }]}
      >
        <View style={styles.section}>
          <Text style={styles.sectionDescription}>
            Your current cooking skill level
          </Text>

          {COOKING_SKILLS.map((skill) => {
            const isSelected = onboarding.selectedCookingSkill === skill.id;
            return (
              <View
                key={skill.id}
                style={[
                  styles.skillCard,
                  isSelected && styles.skillCardSelected,
                ]}
              >
                <View style={styles.skillEmoji}>
                  <Text style={styles.skillEmojiText}>{skill.emoji}</Text>
                </View>
                <View style={styles.skillInfo}>
                  <Text
                    style={[
                      styles.skillLabel,
                      isSelected && styles.skillLabelSelected,
                    ]}
                  >
                    {skill.label}
                  </Text>
                  <Text style={styles.skillDescription}>
                    {skill.description}
                  </Text>
                </View>
                {isSelected && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={Colors.lilac[900]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  skillCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  skillCardSelected: {
    backgroundColor: Colors.lilac[100],
    borderColor: Colors.lilac[900],
  },
  skillEmoji: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  skillEmojiText: {
    fontSize: 32,
  },
  skillInfo: {
    flex: 1,
  },
  skillLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  skillLabelSelected: {
    color: Colors.lilac[900],
  },
  skillDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
