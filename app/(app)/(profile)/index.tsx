import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { getThemeColors } from "@/constants/theme";
import {
    FixedHeader,
    HighlightCard,
    HighlightCardComponent,
    ProfileHeader,
    SettingsSection,
    SettingsSections,
} from "@/features/profile";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useLanguage } from "@/hooks/useLanguage";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
import { router } from "expo-router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Share,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_HEIGHT = 60;
const { width } = Dimensions.get("window");

// Pre-calculate card dimensions to avoid recalculation
const CARD_WIDTH = width * 0.42;
const CARD_ITEM_SIZE = CARD_WIDTH + 16;

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

// Helper function moved outside component to prevent recreation
function formatTime(time: {
  hour: number;
  minute: number;
  period: "AM" | "PM";
}) {
  return `${time.hour}:${time.minute.toString().padStart(2, "0")} ${
    time.period
  }`;
}

export default function ProfileTab() {
  const { profile, session, isLoading: authLoading } = useAuthContext();
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  // Memoize theme colors to prevent recalculation on every render
  const Colors = useMemo(() => getThemeColors(isDark), [isDark]);

  // Optimized scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      "worklet";
      scrollY.value = event.contentOffset.y;
    },
  });

  // Load profile data on mount - intentionally run once
  useEffect(() => {
    onboarding.loadOnboardingData().catch((error) => {
      console.error("Error loading profile data:", error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manage loading state to prevent double loading screen
  useEffect(() => {
    if (!onboarding.isLoading && !authLoading) {
      setIsLoading(false);
    }
  }, [onboarding.isLoading, authLoading]);

  // Update profile data using a ref to track previous values and minimize updates
  useEffect(() => {
    if (onboarding.isLoading) return;

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

  const formattedUnitsSummary = useMemo(() => {
    if (!profileData) return "Metric defaults";
    const summary = [
      profileData.weight ? `${profileData.weight} kg` : undefined,
      profileData.height ? `${profileData.height} cm` : undefined,
    ].filter(Boolean);
    return summary.length ? summary.join(" • ") : "Metric defaults";
  }, [profileData]);

  const highlightCards: HighlightCard[] = useMemo(() => {
    // Body metrics card - weight, height, BMI
    const hasWeight = profileData?.weight;
    const hasHeight = profileData?.height;
    const hasBothMetrics = hasWeight && hasHeight;
    const bmi = hasBothMetrics
      ? (profileData.weight! / Math.pow(profileData.height! / 100, 2)).toFixed(
          1
        )
      : null;
    const bmiCategory = bmi
      ? parseFloat(bmi) < 18.5
        ? t("profile.bmiUnderweight")
        : parseFloat(bmi) < 25
        ? t("profile.bmiNormal")
        : parseFloat(bmi) < 30
        ? t("profile.bmiOverweight")
        : t("profile.bmiObese")
      : null;

    // Goals card
    const goalsCount = profileData?.goals?.length || 0;
    const goalsPreview = profileData?.goals?.slice(0, 2).join(", ");

    // Meal schedule preview
    const hasMealTimes = profileData?.breakfastTime && profileData?.dinnerTime;

    // Taste profile - cuisines and diet
    const cuisineCount = profileData?.cuisines?.length || 0;
    const dietCount = profileData?.dietPreferences?.length || 0;
    const allergyCount = profileData?.allergies?.length || 0;

    return [
      {
        id: "metrics",
        title: t("profile.myMetrics"),
        value: hasBothMetrics
          ? `${profileData.weight} kg • ${profileData.height} cm`
          : hasWeight
          ? `${profileData.weight} kg`
          : hasHeight
          ? `${profileData.height} cm`
          : t("profile.addMetrics"),
        detail: bmi
          ? `BMI ${bmi} • ${bmiCategory}`
          : profileData?.age
          ? `${profileData.age} ${t("profile.yearsOld")}`
          : t("profile.trackYourProgress"),
        icon: "scale-bathroom",
        onPress: () => router.push("/(app)/(profile)/units-nutrition"),
        accentColor: "#FFFFFF",
        gradientColors: ["#60A5FA", "#3B82F6"] as [string, string],
        shadowColor: "#3B82F6",
      },
      {
        id: "schedule",
        title: t("profile.mealSchedule"),
        value: hasMealTimes
          ? `${profileData.breakfastTime} - ${profileData.dinnerTime}`
          : t("profile.pickMealTimes"),
        detail: t("profile.keepRemindersAligned"),
        icon: "clock-time-three-outline",
        onPress: () => router.push("/(app)/(profile)/meal-times"),
        accentColor: "#FFFFFF",
        gradientColors: ["#A78BFA", "#7C3AED"] as [string, string],
        shadowColor: "#7C3AED",
      },
      {
        id: "goals",
        title: t("profile.goals"),
        value:
          goalsCount > 0
            ? `${goalsCount} ${t("profile.activeGoals")}`
            : t("profile.setYourGoals"),
        detail: goalsPreview || t("profile.tapToPersonalize"),
        icon: "target",
        onPress: () => router.push("/(app)/(profile)/goals-metrics"),
        accentColor: "#FFFFFF",
        gradientColors: ["#4ADE80", "#22C55E"] as [string, string],
        shadowColor: "#22C55E",
      },
      {
        id: "taste",
        title: t("profile.tasteProfile"),
        value:
          cuisineCount > 0 || dietCount > 0
            ? `${cuisineCount} ${t("profile.cuisinesLabel")} • ${dietCount} ${t(
                "profile.dietsLabel"
              )}`
            : t("profile.addCuisinesDiets"),
        detail:
          allergyCount > 0
            ? `${allergyCount} ${t("profile.allergiesTracked")}`
            : t("profile.tapToCustomize"),
        icon: "food-apple-outline",
        onPress: () => router.push("/(app)/(profile)/taste-preferences"),
        accentColor: "#FFFFFF",
        gradientColors: ["#F472B6", "#DB2777"] as [string, string],
        shadowColor: "#DB2777",
      },
    ];
  }, [profileData, t]);

  const handleShareApp = useCallback(async () => {
    try {
      await Share.share({
        title: "Plan meals with PlannedEat",
        message:
          "Plan meals effortlessly with PlannedEat. Track goals, sync reminders and get tailored recipes. Download the app to start planning with me!",
      });
    } catch {
      Alert.alert("Share failed", "Unable to open the share sheet right now.");
    }
  }, []);

  // Memoize lilac colors to prevent object recreation
  const lilacColors = useMemo(
    () => ({ color600: Colors.lilac[600], color900: Colors.lilac[900] }),
    [Colors.lilac]
  );

  const settingsSections: SettingsSection[] = useMemo(
    () => [
      {
        id: "personal",
        title: t("profile.personalSettings"),
        items: [
          {
            id: "edit-profile",
            title: t("profile.editProfile"),
            description: t("profile.editProfileDesc"),
            icon: "account-edit-outline",
            onPress: () => router.push("/(app)/(profile)/account"),
            color: lilacColors.color600,
          },
          {
            id: "preferences",
            title: t("profile.unitsNutrition"),
            description: t("profile.unitsNutritionDesc"),
            meta: formattedUnitsSummary,
            icon: "tune",
            onPress: () => router.push("/(app)/(profile)/units-nutrition"),
            color: lilacColors.color900,
          },
          {
            id: "goals-metrics",
            title: t("profile.goalsMetrics"),
            description: t("profile.goalsMetricsDesc"),
            icon: "chart-line",
            onPress: () => router.push("/(app)/(profile)/goals-metrics"),
            color: lilacColors.color900,
          },
          {
            id: "privacy",
            title: t("privacy.title"),
            description: t("profile.privacyDesc"),
            icon: "shield-check-outline",
            onPress: () => router.push("/(app)/(profile)/privacy"),
            color: lilacColors.color900,
          },
          {
            id: "notifications",
            title: t("notifications.title"),
            description: t("profile.notificationsDesc"),
            icon: "bell-outline",
            onPress: () => router.push("/(app)/(profile)/notifications"),
            color: lilacColors.color900,
          },
        ],
      },
      {
        id: "app",
        title: t("profile.appSettings"),
        items: [
          {
            id: "preferences-general",
            title: t("profile.preferences"),
            description: t("profile.preferencesDesc"),
            icon: "cog-outline",
            onPress: () => router.push("/(app)/(profile)/preferences"),
            color: lilacColors.color900,
          },
          {
            id: "meal-times",
            title: t("profile.mealTimes"),
            description: t("profile.mealTimesDesc"),
            icon: "calendar-clock",
            onPress: () => router.push("/(app)/(profile)/meal-times"),
            color: lilacColors.color900,
          },
          {
            id: "social-sharing",
            title: t("profile.socialSharing"),
            description: t("profile.socialSharingDesc"),
            icon: "share-variant-outline",
            onPress: handleShareApp,
            color: lilacColors.color900,
          },
        ],
      },
      {
        id: "more",
        title: t("profile.more"),
        items: [
          {
            id: "taste",
            title: t("profile.tastePreferences"),
            description: t("profile.tastePreferencesDesc"),
            icon: "silverware-fork-knife",
            onPress: () => router.push("/(app)/(profile)/taste-preferences"),
            color: lilacColors.color900,
          },
          {
            id: "allergies",
            title: t("profile.allergiesDiet"),
            description: t("profile.allergiesDietDesc"),
            icon: "alert-circle-outline",
            onPress: () => router.push("/(app)/(profile)/allergies-diet"),
            color: lilacColors.color900,
          },
          {
            id: "cooking",
            title: t("profile.cookingSkill"),
            description: t("profile.cookingSkillDesc"),
            icon: "chef-hat",
            onPress: () => router.push("/(app)/(profile)/cooking-skill"),
            color: lilacColors.color900,
          },
          {
            id: "support",
            title: t("profile.support"),
            description: t("profile.supportDesc"),
            icon: "message-question-outline",
            onPress: () => router.push("/(app)/(profile)/support-feedback"),
            color: lilacColors.color900,
          },
        ],
      },
    ],
    [formattedUnitsSummary, lilacColors, t, handleShareApp]
  );

  // Render function for highlight cards FlatList - stable reference
  const renderHighlightCard = useCallback(
    ({ item, index }: { item: HighlightCard; index: number }) => (
      <HighlightCardComponent card={item} index={index} />
    ),
    []
  );

  // Get item layout for FlatList optimization - using pre-calculated values
  const getHighlightCardLayout = useCallback(
    (_data: ArrayLike<HighlightCard> | null | undefined, index: number) => ({
      length: CARD_ITEM_SIZE,
      offset: CARD_ITEM_SIZE * index,
      index,
    }),
    []
  );

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: HighlightCard) => item.id, []);

  // Memoize content container style to prevent recreation
  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: top + HEADER_HEIGHT + 20,
      paddingBottom: bottom + 80,
    }),
    [top, bottom]
  );

  // Memoize profile header props to prevent unnecessary re-renders
  const profileHeaderProps = useMemo(
    () => ({
      profile: profile || null,
      session: session
        ? {
            user: session.user
              ? {
                  email: session.user.email || null,
                  created_at: session.user.created_at || null,
                }
              : null,
          }
        : null,
    }),
    [profile, session]
  );

  if (isLoading) {
    return <ProfessionalLoadingScreen />;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors.background.primary },
      ]}
    >
      {/* Fixed Header */}
      <FixedHeader scrollY={scrollY} scrollViewRef={scrollViewRef} />

      {/* Scrollable Content */}
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={contentContainerStyle}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        overScrollMode="never"
      >
        {/* User Profile Header */}
        <ProfileHeader {...profileHeaderProps} />

        {/* Highlights - horizontally scrollable with FlatList */}
        <View style={styles.highlightsWrapper}>
          <FlatList
            data={highlightCards}
            renderItem={renderHighlightCard}
            keyExtractor={keyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.highlightsContainer}
            decelerationRate="fast"
            snapToInterval={CARD_ITEM_SIZE}
            getItemLayout={getHighlightCardLayout}
            removeClippedSubviews={true}
            initialNumToRender={3}
            maxToRenderPerBatch={2}
            windowSize={3}
          />
        </View>

        {/* Settings Sections */}
        <SettingsSections sections={settingsSections} />

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: Colors.text.tertiary }]}>
            PlannedEat v1.0.0 • Made with ❤️
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  highlightsWrapper: {
    marginBottom: 24,
  },
  highlightsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
