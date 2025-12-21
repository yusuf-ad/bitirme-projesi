import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { Colors as StaticColors, getThemeColors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabase";
import { updateUserTastePreferences } from "@/lib/supabase-onboarding";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SkillCardProps {
  skill: {
    id: string;
    emoji: string;
    label: string;
    description: string;
  };
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
  colors: any;
}

function SkillCard({ skill, isSelected, onPress, disabled, colors }: SkillCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(glowAnim, {
      toValue: isSelected ? 1 : 0,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [isSelected, glowAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  return (
    <Animated.View
      style={[
        styles.skillCardWrapper,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Glow Effect */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
            backgroundColor: colors.lilac[900],
          },
        ]}
      />

      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
            styles.skillCard, 
            { backgroundColor: colors.background.surface, borderColor: isSelected ? colors.lilac[900] : "transparent" },
            isSelected && { backgroundColor: colors.lilac[100] } 
        ]}
      >
        <View
          style={[
              styles.skillEmoji, 
              { backgroundColor: colors.background.primary },
              isSelected && { backgroundColor: "#FAF5FF" } // Keep light background for emoji for contrast, or adjust
          ]}
        >
          <Text style={styles.skillEmojiText}>{skill.emoji}</Text>
        </View>
        <View style={styles.skillInfo}>
          <Text
            style={[
              styles.skillLabel,
              { color: colors.text.primary },
              isSelected && { color: colors.lilac[900] },
            ]}
          >
            {skill.label}
          </Text>
          <Text 
            style={[
              styles.skillDescription, 
              { color: colors.text.secondary },
              isSelected && { color: colors.lilac[700] }
            ]}
          >
            {skill.description}
          </Text>
        </View>
        {isSelected && (
          <Animated.View
            style={{
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            }}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={colors.lilac[900]}
            />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function CookingSkillScreen() {
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
  const { selection } = useHaptics();
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  const COOKING_SKILLS = [
    {
      id: "beginner",
      emoji: "🍳",
      label: t("cookingSkills.novice"),
      description: t("cookingSkillPage.noviceDesc"),
    },
    {
      id: "basic",
      emoji: "🥘",
      label: t("cookingSkills.basic"),
      description: t("cookingSkillPage.basicDesc"),
    },
    {
      id: "intermediate",
      emoji: "👨‍🍳",
      label: t("cookingSkills.intermediate"),
      description: t("cookingSkillPage.intermediateDesc"),
    },
    {
      id: "advanced",
      emoji: "🍰",
      label: t("cookingSkills.advanced"),
      description: t("cookingSkillPage.advancedDesc"),
    },
  ];

  useEffect(() => {
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleSkillSelect = (skillId: string) => {
    // Prevent duplicate selections
    if (onboarding.selectedCookingSkill === skillId) return;

    selection();

    // Update UI immediately
    onboarding.setSelectedCookingSkill(skillId);

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Store the skillId to save (closure-safe)
    const skillToSave = skillId;

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(() => {
      // If already saving, wait for it to finish then save again
      const performSave = async () => {
        // Wait if another save is in progress
        if (isSavingRef.current) {
          // Schedule retry after a short delay
          setTimeout(performSave, 500);
          return;
        }

        isSavingRef.current = true;
        setIsSaving(true);

        try {
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Directly update only cooking skill in Supabase
            await updateUserTastePreferences(user.id, {
              cooking_skill_level: skillToSave,
            });
            console.log("Cooking skill saved:", skillToSave);
          }
        } catch (error) {
          console.error("Failed to save cooking skill:", error);
        } finally {
          isSavingRef.current = false;
          setIsSaving(false);
        }
      };

      performSave();
    }, 1000); // Wait 1000ms after last selection before saving
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
              borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E5E5"
          }
      ]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>{t("cookingSkillPage.title")}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 20 }]}
      >
        <View style={[styles.section, { backgroundColor: Colors.background.surface }]}>
          <Text style={[styles.sectionDescription, { color: Colors.text.secondary }]}>
            {t("cookingSkillPage.description")}
          </Text>

          {COOKING_SKILLS.map((skill) => {
            const isSelected = onboarding.selectedCookingSkill === skill.id;
            return (
              <SkillCard
                key={skill.id}
                skill={skill}
                isSelected={isSelected}
                onPress={() => handleSkillSelect(skill.id)}
                disabled={isSaving}
                colors={Colors}
              />
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
    backgroundColor: StaticColors.background.secondary,
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
    color: StaticColors.text.primary,
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
    color: StaticColors.text.secondary,
    marginBottom: 20,
  },
  skillCardWrapper: {
    marginBottom: 12,
    position: "relative",
  },
  glowEffect: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 16,
    backgroundColor: StaticColors.lilac[900],
  },
  skillCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 12,
    gap: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  skillCardSelected: {
    backgroundColor: StaticColors.lilac[100],
    borderColor: StaticColors.lilac[900],
  },
  skillEmoji: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  skillEmojiSelected: {
    backgroundColor: "#FAF5FF",
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
    color: StaticColors.text.primary,
    marginBottom: 4,
  },
  skillLabelSelected: {
    color: StaticColors.lilac[900],
  },
  skillDescription: {
    fontSize: 14,
    color: StaticColors.text.secondary,
  },
});
