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

export default function TastePreferencesScreen() {
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCookingSkillEmoji = (skill?: string) => {
    switch (skill) {
      case "novice":
        return "🍳";
      case "basic":
        return "🥘";
      case "intermediate":
        return "👨‍🍳";
      case "advanced":
        return "🍰";
      default:
        return "🍳";
    }
  };

  const getCookingSkillLabel = (skill?: string) => {
    switch (skill) {
      case "novice":
        return "Novice";
      case "basic":
        return "Basic";
      case "intermediate":
        return "Intermediate";
      case "advanced":
        return "Advanced";
      default:
        return "Not set";
    }
  };

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
        <Text style={styles.headerTitle}>Taste Preferences</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 20 }]}
      >
        {/* Cooking Skill */}
        {onboarding.selectedCookingSkill && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="chef-hat"
                size={20}
                color={Colors.lilac[900]}
              />
              <Text style={styles.sectionTitle}>Cooking Skill</Text>
            </View>
            <View style={styles.cookingSkillBadge}>
              <Text style={styles.cookingSkillEmoji}>
                {getCookingSkillEmoji(onboarding.selectedCookingSkill)}
              </Text>
              <Text style={styles.cookingSkillText}>
                {getCookingSkillLabel(onboarding.selectedCookingSkill)}
              </Text>
            </View>
          </View>
        )}

        {/* Meal Types */}
        {onboarding.selectedMeals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={20}
                color={Colors.lilac[900]}
              />
              <Text style={styles.sectionTitle}>Meal Types</Text>
            </View>
            <View style={styles.tagsContainer}>
              {onboarding.selectedMeals.map((meal, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{meal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Cuisines */}
        {onboarding.selectedCuisines.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="earth"
                size={20}
                color={Colors.lilac[900]}
              />
              <Text style={styles.sectionTitle}>Favorite Cuisines</Text>
            </View>
            <View style={styles.tagsContainer}>
              {onboarding.selectedCuisines.map((cuisine, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{cuisine}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
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
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  cookingSkillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lilac[100],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: "flex-start",
    gap: 12,
  },
  cookingSkillEmoji: {
    fontSize: 24,
  },
  cookingSkillText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.lilac[900],
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.lilac[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: Colors.lilac[900],
    fontWeight: "500",
  },
});
