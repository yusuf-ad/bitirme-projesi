import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { Colors as StaticColors, getThemeColors } from "@/constants/theme";
import {
    conflictingGoals,
    goalOptions,
} from "@/features/onboarding/sections/goals/goals-content";
import { useLanguage } from "@/hooks/useLanguage";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function GoalsMetricsScreen() {
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
  const [isEditing, setIsEditing] = useState(false);
  const [localGoals, setLocalGoals] = useState<string[]>([]);

  useEffect(() => {
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalGoals(onboarding.selectedGoals);
  }, [onboarding.selectedGoals]);

  const handleToggleGoal = (goalId: string) => {
    let newSelection: string[];

    if (localGoals.includes(goalId)) {
      // Deselect the goal
      newSelection = localGoals.filter((id) => id !== goalId);
    } else {
      // Select the goal and remove any conflicting goals
      const conflictingGoalIds = conflictingGoals[goalId] || [];
      newSelection = [
        ...localGoals.filter((id) => !conflictingGoalIds.includes(id)),
        goalId,
      ];
    }
    setLocalGoals(newSelection);
  };

  const handleSave = async () => {
    await onboarding.saveGoals(localGoals);
    setIsEditing(false);
  };

  if (onboarding.isLoading) {
    return <ProfessionalLoadingScreen />;
  }

  return (
    <View style={[styles.container, { paddingTop: top, backgroundColor: Colors.background.primary }]}>
      {/* Header */}
      <View style={[
          styles.header, 
          { 
              backgroundColor: Colors.background.surface,
              borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : Colors.border.light 
          }
      ]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>{t("goals.title")}</Text>
        <Pressable
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
          style={styles.editButton}
        >
          <MaterialCommunityIcons
            name={isEditing ? "check" : "pencil-outline"}
            size={24}
            color={Colors.lilac[900]}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Goals Section */}
        <View style={[styles.section, { backgroundColor: Colors.background.surface }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="target"
              size={20}
              color={Colors.lilac[900]}
            />
            <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>{t("goals.yourGoals")}</Text>
          </View>

          <View style={styles.goalsGrid}>
            {(isEditing
              ? goalOptions
              : goalOptions.filter((g) => localGoals.includes(g.id))
            ).map((option) => {
              const isSelected = localGoals.includes(option.id);

              if (!isEditing && !isSelected) return null;

              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.goalItem,
                    isEditing && !isSelected && styles.goalItemUnselected,
                  ]}
                  onPress={
                    isEditing ? () => handleToggleGoal(option.id) : undefined
                  }
                  disabled={!isEditing}
                >
                  <View
                    style={[
                      styles.goalIconCircle,
                      { backgroundColor: isDark ? Colors.background.secondary : "#F5F5F5" },
                      isSelected && { backgroundColor: isDark ? Colors.lilac[900] + "20" : "#F0EDFF", borderColor: Colors.lilac[400] },
                    ]}
                  >
                    <Text style={styles.goalEmoji}>{option.emoji}</Text>
                    {isEditing && isSelected && (
                      <View style={[styles.checkmarkBadge, { backgroundColor: Colors.background.surface }]}>
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={18}
                          color={Colors.green[900]}
                        />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.goalTitle,
                      { color: Colors.text.secondary },
                      isSelected && { color: Colors.lilac[900], fontWeight: "600" },
                    ]}
                    numberOfLines={2}
                  >
                    {option.title.replace("\n", " ")}
                  </Text>
                </Pressable>
              );
            })}
            {!isEditing && localGoals.length === 0 && (
              <Text style={[styles.emptyText, { color: Colors.text.secondary }]}>{t("goals.noGoalsSelected")}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StaticColors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: StaticColors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: StaticColors.border.light,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: StaticColors.text.primary,
  },
  editButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  section: {
    backgroundColor: StaticColors.background.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: StaticColors.text.primary,
  },
  // Goals Styles
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    rowGap: 20,
  },
  goalItem: {
    width: (width - 72) / 4,
    alignItems: "center",
  },
  goalItemUnselected: {
    opacity: 0.4,
  },
  goalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  goalIconCircleSelected: {
    backgroundColor: "#F0EDFF",
    borderColor: StaticColors.lilac[400],
  },
  goalEmoji: {
    fontSize: 32,
  },
  checkmarkBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: StaticColors.background.surface,
    borderRadius: 10,
    zIndex: 10,
  },
  goalTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: StaticColors.text.secondary,
    textAlign: "center",
    lineHeight: 16,
  },
  goalTitleSelected: {
    color: StaticColors.lilac[900],
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: StaticColors.text.secondary,
    fontStyle: "italic",
    textAlign: "center",
    width: "100%",
    marginTop: 20,
  },
});
