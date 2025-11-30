import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { getThemeColors } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProfileData {
  goals: string[];
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  breakfastTime?: string;
  lunchTime?: string;
  dinnerTime?: string;
  meals: string[];
  cuisines: string[];
  allergies: string[];
  dietPreferences: string[];
  cookingSkill?: string;
}

interface MenuItem {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}

interface SettingsSection {
  id: string;
  title: string;
  items: MenuItem[];
}

interface HighlightCard {
  id: string;
  title: string;
  value: string;
  detail?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  accentColor: string;
  backgroundColor: string;
  iconBackgroundColor: string;
}

export default function ProfileTab() {
  const { profile, session, isLoading: authLoading } = useAuthContext();
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();
  const { theme, toggleTheme, isDark } = useTheme();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const Colors = getThemeColors(isDark);

  // Animation for theme toggle icon
  const iconRotation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withSpring(isDark ? "360deg" : "0deg", {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  // Container animation for smooth theme transition
  const containerAnimation = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 300 }),
    };
  });

  useEffect(() => {
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update profile data whenever context values change
  useEffect(() => {
    if (!onboarding.isLoading) {
      setProfileData({
        goals: onboarding.selectedGoals,
        gender: onboarding.selectedGender,
        age: onboarding.age,
        height: onboarding.height,
        weight: onboarding.weight,
        breakfastTime: formatTime(onboarding.breakfastTime),
        lunchTime: formatTime(onboarding.lunchTime),
        dinnerTime: formatTime(onboarding.dinnerTime),
        meals: onboarding.selectedMeals,
        cuisines: onboarding.selectedCuisines,
        allergies: onboarding.selectedAllergies,
        dietPreferences: onboarding.selectedDietPreferences,
        cookingSkill: onboarding.selectedCookingSkill,
      });
    }
  }, [
    onboarding.isLoading,
    onboarding.selectedGoals,
    onboarding.selectedGender,
    onboarding.age,
    onboarding.height,
    onboarding.weight,
    onboarding.breakfastTime,
    onboarding.lunchTime,
    onboarding.dinnerTime,
    onboarding.selectedMeals,
    onboarding.selectedCuisines,
    onboarding.selectedAllergies,
    onboarding.selectedDietPreferences,
    onboarding.selectedCookingSkill,
  ]);

  // Manage loading state to prevent double loading screen
  useEffect(() => {
    if (!onboarding.isLoading && !authLoading) {
      setIsLoading(false);
    }
  }, [onboarding.isLoading, authLoading]);

  const loadProfileData = async () => {
    try {
      await onboarding.loadOnboardingData();
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  function handleSignOut() {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out? Your saved preferences will stay on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.auth.signOut();
            } catch (error) {
              Alert.alert(
                "Error",
                "We couldn't sign you out. Please try again."
              );
            }
          },
        },
      ]
    );
  }

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (session?.user?.email) {
      return session.user.email.slice(0, 2).toUpperCase();
    }
    return "SC";
  };

  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (session?.user?.email) return session.user.email.split("@")[0];
    return "User";
  };

  const getMemberSinceDate = () => {
    if (session?.user?.created_at) {
      const date = new Date(session.user.created_at);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    return "Recently";
  };

  const formattedUnitsSummary = useMemo(() => {
    if (!profileData) return "Metric defaults";
    const summary = [
      profileData.weight ? `${profileData.weight} kg` : undefined,
      profileData.height ? `${profileData.height} cm` : undefined,
    ].filter(Boolean);
    return summary.length ? summary.join(" • ") : "Metric defaults";
  }, [profileData]);

  const highlightCards: HighlightCard[] = useMemo(() => {
    const cuisineLabel =
      profileData?.cuisines && profileData.cuisines.length > 0
        ? profileData.cuisines.slice(0, 1).join(", ")
        : undefined;
    const dietLabel =
      profileData?.dietPreferences && profileData.dietPreferences.length > 0
        ? profileData.dietPreferences.slice(0, 1).join(", ")
        : undefined;

    return [
      {
        id: "goals",
        title: "Goals",
        value: profileData?.goals?.length
          ? `${profileData.goals.length} active`
          : "Set your goals",
        detail:
          profileData?.goals?.length && profileData.goals.length > 0
            ? profileData.goals.slice(0, 2).join(", ")
            : "Tap to personalize your plan",
        icon: "target",
        onPress: () => router.push("/(app)/(profile)/goals-metrics"),
        accentColor: Colors.green[800],
        backgroundColor: Colors.green[100],
        iconBackgroundColor: Colors.green[200],
      },
      {
        id: "schedule",
        title: "Meal schedule",
        value:
          profileData?.breakfastTime && profileData?.dinnerTime
            ? `${profileData.breakfastTime} • ${profileData.dinnerTime}`
            : "Pick meal times",
        detail: "Keep reminders aligned with your day",
        icon: "clock-time-three-outline",
        onPress: () => router.push("/(app)/(profile)/meal-times"),
        accentColor: Colors.lilac[800],
        backgroundColor: Colors.lilac[100],
        iconBackgroundColor: Colors.lilac[200],
      },
      {
        id: "taste",
        title: "Taste profile",
        value:
          cuisineLabel || dietLabel
            ? [cuisineLabel, dietLabel].filter(Boolean).join(" • ")
            : "Add cuisines & diets",
        detail: `${profileData?.allergies?.length || 0} allergies tracked`,
        icon: "food-apple-outline",
        onPress: () => router.push("/(app)/(profile)/taste-preferences"),
        accentColor: Colors.purple[700],
        backgroundColor: Colors.beige[100],
        iconBackgroundColor: Colors.beige[300],
      },
    ];
  }, [profileData]);

  const settingsSections: SettingsSection[] = useMemo(
    () => [
      {
        id: "personal",
        title: "Personal Settings",
        items: [
          {
            id: "edit-profile",
            title: "Edit Profile",
            description: "Avatar, name, contact details",
            icon: "account-edit-outline",
            onPress: () => router.push("/(app)/(profile)/account"),
          },
          {
            id: "preferences",
            title: "Units & Nutrition Defaults",
            description: "Macro targets, measurement system",
            meta: formattedUnitsSummary,
            icon: "tune",
            onPress: () => router.push("/(app)/(profile)/preferences"),
          },
          {
            id: "goals-metrics",
            title: "Goals & Metrics",
            description: "Weight, activity & progress",
            icon: "chart-line",
            onPress: () => router.push("/(app)/(profile)/goals-metrics"),
          },
          {
            id: "privacy",
            title: "Privacy & Data",
            description: "Manage insights & sharing",
            icon: "shield-check-outline",
            onPress: () => router.push("/(app)/(profile)/privacy"),
          },
          {
            id: "notifications",
            title: "Notifications",
            description: "Meal reminders & summaries",
            icon: "bell-outline",
            onPress: () => router.push("/(app)/(profile)/notifications"),
          },
        ],
      },
      {
        id: "app",
        title: "App Settings",
        items: [
          {
            id: "meal-times",
            title: "Meal Times",
            description: "Breakfast, lunch and dinner windows",
            icon: "calendar-clock",
            onPress: () => router.push("/(app)/(profile)/meal-times"),
          },
          {
            id: "apple-watch",
            title: "Apple Watch",
            description: "Sync rings & activity calories",
            icon: "watch-variant",
            onPress: () =>
              router.push({
                pathname: "/(app)/(profile)/integrations",
                params: { focus: "apple" },
              }),
          },
          {
            id: "partner-accounts",
            title: "Partner Accounts",
            description: "Strava, Fitbit & more",
            icon: "handshake-outline",
            onPress: () =>
              router.push({
                pathname: "/(app)/(profile)/integrations",
                params: { focus: "partners" },
              }),
          },
          {
            id: "social-sharing",
            title: "Social Sharing",
            description: "Invite friends & share wins",
            icon: "share-variant-outline",
            onPress: () => handleShareApp(),
          },
        ],
      },
      {
        id: "more",
        title: "More",
        items: [
          {
            id: "taste",
            title: "Taste Preferences",
            description: "Meals, cuisines & dislikes",
            icon: "silverware-fork-knife",
            onPress: () => router.push("/(app)/(profile)/taste-preferences"),
          },
          {
            id: "allergies",
            title: "Allergies & Diet",
            description: "Medical restrictions & macros",
            icon: "alert-circle-outline",
            onPress: () => router.push("/(app)/(profile)/allergies-diet"),
          },
          {
            id: "cooking",
            title: "Cooking Skill",
            description: `Currently ${getCookingSkillLabel(
              profileData?.cookingSkill
            )}`,
            icon: "chef-hat",
            onPress: () => router.push("/(app)/(profile)/cooking-skill"),
          },
          {
            id: "support",
            title: "Support & Feedback",
            description: "Chat with us or send an email",
            icon: "message-question-outline",
            onPress: () => router.push("/(app)/(profile)/support-feedback"),
          },
        ],
      },
    ],
    [formattedUnitsSummary, profileData?.cookingSkill]
  );

  async function handleShareApp() {
    try {
      await Share.share({
        title: "Plan meals with PlannedEat",
        message:
          "Plan meals effortlessly with PlannedEat. Track goals, sync reminders and get tailored recipes. Download the app to start planning with me!",
      });
    } catch (error) {
      Alert.alert("Share failed", "Unable to open the share sheet right now.");
    }
  }

  const formatTime = (time: {
    hour: number;
    minute: number;
    period: "AM" | "PM";
  }) => {
    return `${time.hour}:${time.minute.toString().padStart(2, "0")} ${
      time.period
    }`;
  };

  function getCookingSkillEmoji(skill?: string) {
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
  }

  function getCookingSkillLabel(skill?: string) {
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
  }

  const renderMenuItem = (item: MenuItem, index: number, array: MenuItem[]) => (
    <View key={item.id}>
      <Pressable
        style={({ pressed }) => [
          styles.menuItem,
          pressed && { backgroundColor: isDark ? "#25222E" : "#F8F8F8" },
        ]}
        onPress={() => {
          Haptics.selectionAsync();
          item.onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={item.title}
        accessibilityHint={item.description}
      >
        <View style={styles.menuItemLeft}>
          <View
            style={[
              styles.menuIconContainer,
              { backgroundColor: isDark ? "#25222E" : "#F4F4F7" },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={22}
              color={Colors.text.primary}
            />
          </View>
          <View style={styles.menuItemCopy}>
            <Text style={[styles.menuItemText, { color: Colors.text.primary }]}>
              {item.title}
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.menuItemDescription,
                  { color: Colors.text.secondary },
                ]}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.metaWrapper}>
          {item.meta && (
            <Text style={[styles.menuItemMeta, { color: Colors.text.primary }]}>
              {item.meta}
            </Text>
          )}
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={isDark ? Colors.gray[400] : Colors.gray[400]}
          />
        </View>
      </Pressable>
      {index < array.length - 1 && (
        <View
          style={[
            styles.separator,
            { backgroundColor: isDark ? "#2A2730" : "#F0F0F0" },
          ]}
        />
      )}
    </View>
  );

  if (isLoading) {
    return <ProfessionalLoadingScreen />;
  }

  return (
    <Animated.ScrollView
      style={[
        styles.container,
        containerAnimation,
        { paddingTop: top, backgroundColor: Colors.background.secondary },
      ]}
      contentContainerStyle={[styles.content, { paddingBottom: bottom + 64 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerBar}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleTheme();
          }}
          hitSlop={12}
          style={[styles.iconButton, styles.iconButtonLeft]}
          accessibilityRole="button"
          accessibilityLabel={
            isDark ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          <Animated.View style={iconRotation}>
            <MaterialCommunityIcons
              name={isDark ? "white-balance-sunny" : "moon-waning-crescent"}
              size={22}
              color={isDark ? "#FDB022" : Colors.lilac[800]}
            />
          </Animated.View>
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>
          Settings
        </Text>
        <Pressable
          onPress={handleSignOut}
          hitSlop={12}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
        </Pressable>
      </View>

      {/* User Profile Header */}
      <View
        style={[
          styles.profileHeader,
          { backgroundColor: Colors.background.surface },
        ]}
      >
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: Colors.text.primary },
          ]}
        >
          <Text style={[styles.avatarText, { color: Colors.text.inverse }]}>
            {getUserInitials()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: Colors.text.primary }]}>
            {getUserDisplayName()}
          </Text>
          <Text
            style={[
              styles.profileMemberSince,
              { color: Colors.text.secondary },
            ]}
          >
            Member since {getMemberSinceDate()}
          </Text>
        </View>
      </View>

      {/* Highlights - horizontally scrollable */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.highlightsContainer}
      >
        {highlightCards.map((card) => (
          <Pressable
            key={card.id}
            onPress={() => {
              Haptics.selectionAsync();
              card.onPress();
            }}
            style={({ pressed }) => [
              styles.highlightCard,
              {
                backgroundColor: isDark
                  ? Colors.background.surface
                  : card.backgroundColor,
                borderColor: isDark
                  ? Colors.border.light
                  : card.iconBackgroundColor,
              },
              pressed && styles.highlightCardPressed,
            ]}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.highlightIcon,
                {
                  backgroundColor: isDark
                    ? Colors.background.tertiary
                    : card.iconBackgroundColor,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={card.icon}
                size={18}
                color={card.accentColor}
              />
            </View>
            <Text style={[styles.highlightLabel, { color: card.accentColor }]}>
              {card.title}
            </Text>
            <Text
              style={[styles.highlightValue, { color: Colors.text.primary }]}
              numberOfLines={1}
            >
              {card.value}
            </Text>
            {card.detail && (
              <Text
                style={[
                  styles.highlightDetail,
                  { color: Colors.text.secondary },
                ]}
                numberOfLines={2}
              >
                {card.detail}
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Sections */}
      {settingsSections.map((section) => (
        <View key={section.id} style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: Colors.text.secondary }]}>
            {section.title}
          </Text>
          <View
            style={[
              styles.menuContainer,
              { backgroundColor: Colors.background.surface },
            ]}
          >
            {section.items.map((item, index, array) =>
              renderMenuItem(item, index, array)
            )}
          </View>
        </View>
      ))}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 16,
    letterSpacing: 1.1,
    fontWeight: "600",
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.10)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconButton: {
    position: "absolute",
    right: 0,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  iconButtonLeft: {
    position: "absolute",
    left: 0,
    right: "auto",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileMemberSince: {
    fontSize: 14,
    opacity: 0.8,
  },
  highlightsContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 4,
    gap: 12,
    marginBottom: 28,
  },
  highlightCard: {
    width: 210,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  highlightCardPressed: {
    opacity: 0.8,
  },
  highlightIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  highlightLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  highlightValue: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  highlightDetail: {
    fontSize: 12,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
  },
  menuItemCopy: {
    flex: 1,
  },
  menuItemDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  menuItemMeta: {
    fontSize: 13,
    fontWeight: "500",
  },
  metaWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  separator: {
    height: 1,
    marginLeft: 64,
  },
});
