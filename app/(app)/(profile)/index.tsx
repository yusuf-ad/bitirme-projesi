import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { getThemeColors } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabase";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeInRight,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_HEIGHT = 60;
const SCROLL_THRESHOLD = 100;
const { width } = Dimensions.get("window");

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
  color?: string;
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
  gradientColors: [string, string];
  shadowColor: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MenuItemComponent = ({ item, index, isDark }: { item: MenuItem; index: number; isDark: boolean }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 50).springify()}
      style={styles.menuItemWrapper}
    >
      <AnimatedPressable
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[
          styles.menuItem,
          { backgroundColor: isDark ? "#1F1F1F" : "#FFFFFF" },
          animatedStyle
        ]}
        onPress={() => {
          Haptics.selectionAsync();
          item.onPress();
        }}
      >
        <View style={styles.menuItemLeft}>
          <View
            style={[
              styles.menuIconContainer,
              { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.03)" },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={20}
              color={item.color || (isDark ? "#FFFFFF" : "#000000")}
            />
          </View>
          <View style={styles.menuItemCopy}>
            <Text style={[styles.menuItemText, { color: isDark ? "#FFFFFF" : "#000000" }]}>
              {item.title}
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.menuItemDescription,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.metaWrapper}>
          {item.meta && (
            <Text 
              style={[styles.menuItemMeta, { color: isDark ? "#9CA3AF" : "#6B7280" }]}
              numberOfLines={1}
            >
              {item.meta}
            </Text>
          )}
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

export default function ProfileTab() {
  const { profile, session, isLoading: authLoading } = useAuthContext();
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useLanguage();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const Colors = getThemeColors(isDark);
  const scrollY = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  // Scroll to top animation values
  const scrollToTopScale = useSharedValue(1);
  const scrollToTopRotation = useSharedValue(0);

  // Scroll to top with smooth animation and visual feedback
  const scrollToTop = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Trigger bounce animation on avatar
    scrollToTopScale.value = withSpring(0.85, { damping: 8, stiffness: 400 }, () => {
      scrollToTopScale.value = withSpring(1.1, { damping: 6, stiffness: 300 }, () => {
        scrollToTopScale.value = withSpring(1, { damping: 10, stiffness: 200 });
      });
    });
    
    // Trigger rotation animation
    scrollToTopRotation.value = withSpring(-15, { damping: 8, stiffness: 400 }, () => {
      scrollToTopRotation.value = withSpring(0, { damping: 10, stiffness: 200 });
    });
    
    // Smooth scroll to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  // Animated style for scroll to top button
  const scrollToTopAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scrollToTopScale.value },
        { rotate: `${scrollToTopRotation.value}deg` },
      ],
    };
  });

  // Scroll handler for header animation
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header background fade in animation (synced with scroll)
  const headerBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.5, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const borderOpacity = interpolate(
        scrollY.value,
        [SCROLL_THRESHOLD * 0.8, SCROLL_THRESHOLD],
        [0, 1],
        Extrapolation.CLAMP
    );
    return { 
        opacity,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? `rgba(255,255,255,${borderOpacity * 0.1})` : `rgba(0,0,0,${borderOpacity * 0.05})`
    };
  });

  // Profile avatar animation - slides in from left with scale and rotation
  const profileAvatarStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.6, SCROLL_THRESHOLD * 1.1],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateX = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.6, SCROLL_THRESHOLD * 1.1],
      [-20, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.6, SCROLL_THRESHOLD * 1.1],
      [0.5, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateX }, { scale }],
    };
  });

  // Profile name animation - slides in from right with slight delay
  const profileNameStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.8, SCROLL_THRESHOLD * 1.2],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateX = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.8, SCROLL_THRESHOLD * 1.2],
      [15, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  // SETTINGS title fade out animation (in header)
  const inContentTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD * 0.6],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD * 0.6],
      [1, 0.9],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

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
      t("profile.signOut"),
      t("profile.signOutConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("profile.signOut"),
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.auth.signOut();
            } catch (error) {
              Alert.alert(
                t("common.error"),
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
    // Body metrics card - weight, height, BMI
    const hasWeight = profileData?.weight;
    const hasHeight = profileData?.height;
    const hasBothMetrics = hasWeight && hasHeight;
    const bmi = hasBothMetrics 
      ? (profileData.weight! / Math.pow(profileData.height! / 100, 2)).toFixed(1)
      : null;
    const bmiCategory = bmi 
      ? parseFloat(bmi) < 18.5 ? t("profile.bmiUnderweight")
        : parseFloat(bmi) < 25 ? t("profile.bmiNormal")
        : parseFloat(bmi) < 30 ? t("profile.bmiOverweight")
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
        gradientColors: ["#60A5FA", "#3B82F6"],
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
        gradientColors: ["#A78BFA", "#7C3AED"],
        shadowColor: "#7C3AED",
      },
      {
        id: "goals",
        title: t("profile.goals"),
        value: goalsCount > 0 
          ? `${goalsCount} ${t("profile.activeGoals")}`
          : t("profile.setYourGoals"),
        detail: goalsPreview || t("profile.tapToPersonalize"),
        icon: "target",
        onPress: () => router.push("/(app)/(profile)/goals-metrics"),
        accentColor: "#FFFFFF",
        gradientColors: ["#4ADE80", "#22C55E"],
        shadowColor: "#22C55E",
      },
      {
        id: "taste",
        title: t("profile.tasteProfile"),
        value: cuisineCount > 0 || dietCount > 0
          ? `${cuisineCount} ${t("profile.cuisinesLabel")} • ${dietCount} ${t("profile.dietsLabel")}`
          : t("profile.addCuisinesDiets"),
        detail: allergyCount > 0 
          ? `${allergyCount} ${t("profile.allergiesTracked")}`
          : t("profile.tapToCustomize"),
        icon: "food-apple-outline",
        onPress: () => router.push("/(app)/(profile)/taste-preferences"),
        accentColor: "#FFFFFF",
        gradientColors: ["#F472B6", "#DB2777"],
        shadowColor: "#DB2777",
      },
    ];
  }, [profileData, t]);

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
            color: Colors.lilac[600],
          },
          {
            id: "preferences",
            title: t("profile.unitsNutrition"),
            description: t("profile.unitsNutritionDesc"),
            meta: formattedUnitsSummary,
            icon: "tune",
            onPress: () => router.push("/(app)/(profile)/units-nutrition"),
            color: Colors.lilac[900],
          },
          {
            id: "goals-metrics",
            title: t("profile.goalsMetrics"),
            description: t("profile.goalsMetricsDesc"),
            icon: "chart-line",
            onPress: () => router.push("/(app)/(profile)/goals-metrics"),
            color: Colors.lilac[900],
          },
          {
            id: "privacy",
            title: t("privacy.title"),
            description: t("profile.privacyDesc"),
            icon: "shield-check-outline",
            onPress: () => router.push("/(app)/(profile)/privacy"),
            color: Colors.lilac[900],
          },
          {
            id: "notifications",
            title: t("notifications.title"),
            description: t("profile.notificationsDesc"),
            icon: "bell-outline",
            onPress: () => router.push("/(app)/(profile)/notifications"),
            color: Colors.lilac[900],
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
            color: Colors.lilac[900],
          },
          {
            id: "meal-times",
            title: t("profile.mealTimes"),
            description: t("profile.mealTimesDesc"),
            icon: "calendar-clock",
            onPress: () => router.push("/(app)/(profile)/meal-times"),
            color: Colors.lilac[900],
          },
          {
            id: "social-sharing",
            title: t("profile.socialSharing"),
            description: t("profile.socialSharingDesc"),
            icon: "share-variant-outline",
            onPress: () => handleShareApp(),
            color: Colors.lilac[900],
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
            color: Colors.lilac[900],
          },
          {
            id: "allergies",
            title: t("profile.allergiesDiet"),
            description: t("profile.allergiesDietDesc"),
            icon: "alert-circle-outline",
            onPress: () => router.push("/(app)/(profile)/allergies-diet"),
            color: Colors.lilac[900],
          },
          {
            id: "cooking",
            title: t("profile.cookingSkill"),
            description: t("profile.cookingSkillDesc"),
            icon: "chef-hat",
            onPress: () => router.push("/(app)/(profile)/cooking-skill"),
            color: Colors.lilac[900],
          },
          {
            id: "support",
            title: t("profile.support"),
            description: t("profile.supportDesc"),
            icon: "message-question-outline",
            onPress: () => router.push("/(app)/(profile)/support-feedback"),
            color: Colors.lilac[900],
          },
        ],
      },
    ],
    [formattedUnitsSummary, profileData?.cookingSkill, t]
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

  if (isLoading) {
    return <ProfessionalLoadingScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background.secondary }]}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, { paddingTop: top }]}>
        {/* Header Background (fades in on scroll) */}
        <Animated.View
          style={[
            styles.headerBackground,
            { height: HEADER_HEIGHT + top, backgroundColor: Colors.background.surface },
            headerBackgroundStyle,
          ]}
        />

        {/* Header Content */}
        <View style={styles.headerContent}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              toggleTheme();
            }}
            hitSlop={12}
            style={styles.headerIconButton}
            accessibilityRole="button"
            accessibilityLabel={
              isDark ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <View style={[styles.iconButtonCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]}>
              <Animated.View style={iconRotation}>
                <MaterialCommunityIcons
                  name={isDark ? "white-balance-sunny" : "moon-waning-crescent"}
                  size={20}
                  color={isDark ? "#FDB022" : Colors.lilac[800]}
                />
              </Animated.View>
            </View>
          </Pressable>

          {/* Header Center - SETTINGS title or Profile Avatar & Name */}
          <View style={styles.headerTitleContainer}>
            {/* SETTINGS title (visible initially, fades out on scroll) */}
            <Animated.View style={[styles.headerSettingsWrapper, inContentTitleStyle]}>
              <Text style={[styles.headerSettingsTitle, { color: Colors.text.primary }]}>
                {t("profile.settings")}
              </Text>
            </Animated.View>
            
            {/* Profile Avatar & Name (slides in on scroll) - Tappable to scroll to top */}
            <Pressable onPress={scrollToTop} style={styles.headerProfileTouchable}>
              <Animated.View style={[styles.headerProfileRow, profileAvatarStyle]}>
                <View
                  style={[
                    styles.headerAvatar,
                    { backgroundColor: Colors.text.primary },
                  ]}
                >
                  <Text style={[styles.headerAvatarText, { color: Colors.text.inverse }]}>
                    {getUserInitials()}
                  </Text>
                </View>
                <Animated.View style={profileNameStyle}>
                  <Text style={[styles.headerProfileName, { color: Colors.text.primary }]} numberOfLines={1}>
                    {getUserDisplayName()}
                  </Text>
                </Animated.View>
              </Animated.View>
            </Pressable>
          </View>

          <Pressable
            onPress={handleSignOut}
            hitSlop={12}
            style={styles.headerIconButton}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <View style={[styles.iconButtonCircle, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)" }]}>
              <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        ref={scrollViewRef}
        style={[styles.scroll, containerAnimation]}
        contentContainerStyle={[styles.content, { paddingTop: top + HEADER_HEIGHT + 20, paddingBottom: bottom + 80 }]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
      {/* User Profile Header */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.profileHeader}
      >
        <LinearGradient
            colors={[Colors.lilac[900], Colors.lilac[900], Colors.lilac[900]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradientBorder}
        >
            <View
            style={[
                styles.avatarContainer,
                { backgroundColor: Colors.background.secondary },
            ]}
            >
            {profile?.avatar_url ? (
                <ExpoImage
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={200}
                />
            ) : (
                <Text style={[styles.avatarText, { color: Colors.lilac[800] }]}>
                {getUserInitials()}
                </Text>
            )}
            </View>
        </LinearGradient>
        
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: Colors.text.primary }]}>
            {getUserDisplayName()}
          </Text>
          <Text
            style={[
              styles.profileMemberSince,
              { color: Colors.text.tertiary },
            ]}
          >
            {t("profile.memberSince")} {getMemberSinceDate()}
          </Text>
        </View>
      </Animated.View>

      {/* Highlights - horizontally scrollable */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.highlightsContainer}
        decelerationRate="fast"
        snapToInterval={width * 0.75 + 12}
      >
        {highlightCards.map((card, index) => (
          <Animated.View 
            key={card.id} 
            entering={FadeInRight.delay(200 + index * 100).springify()}
          >
            <Pressable
                onPress={() => {
                Haptics.selectionAsync();
                card.onPress();
                }}
                style={({ pressed }) => [
                styles.highlightCard,
                { 
                    backgroundColor: card.gradientColors[0],
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    shadowColor: card.shadowColor,
                },
                ]}
            >
                <LinearGradient
                    colors={card.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.highlightHeader}>
                    <View
                        style={[
                        styles.highlightIcon,
                        { backgroundColor: "rgba(255,255,255,0.2)" },
                        ]}
                    >
                        <MaterialCommunityIcons
                        name={card.icon}
                        size={20}
                        color="#FFFFFF"
                        />
                    </View>
                    <Text style={[styles.highlightTitle, { color: "#FFFFFF" }]}>
                        {card.title}
                    </Text>
                </View>

                <View style={styles.highlightContent}>
                    <Text style={[styles.highlightValue, { color: "#FFFFFF" }]}>
                        {card.value}
                    </Text>
                    {card.detail && (
                        <Text style={[styles.highlightDetail, { color: "rgba(255,255,255,0.8)" }]}>
                        {card.detail}
                        </Text>
                    )}
                </View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Settings Sections */}
      <View style={styles.settingsContainer}>
        {settingsSections.map((section, sectionIndex) => (
          <Animated.View 
            key={section.id} 
            style={styles.sectionWrapper}
            entering={FadeInDown.delay(400 + sectionIndex * 100).springify()}
          >
            <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>
              {section.title}
            </Text>
            <View style={styles.sectionItems}>
              {section.items.map((item, index) => (
                <MenuItemComponent key={item.id} item={item} index={index} isDark={isDark} />
              ))}
            </View>
          </Animated.View>
        ))}
      </View>

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
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  headerContent: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headerSettingsWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSettingsTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerProfileTouchable: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  headerProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    fontSize: 12,
    fontWeight: "700",
  },
  headerProfileName: {
    fontSize: 15,
    fontWeight: "600",
    maxWidth: 150,
  },
  scroll: {
    flex: 1,
  },
  content: {
    // Padding handled in contentContainerStyle
  },
  profileHeader: {
    marginHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 12,
  },
  avatarGradientBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  profileMemberSince: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.6,
  },
  highlightsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  highlightCard: {
    width: width * 0.42,
    height: 160,
    borderRadius: 24,
    padding: 16,
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  highlightHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  highlightContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  highlightTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.9,
    textAlign: "center",
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  highlightDetail: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.85,
    lineHeight: 14,
    textAlign: "center",
  },
  settingsContainer: {
    paddingHorizontal: 16,
    gap: 24,
  },
  sectionWrapper: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionItems: {
    gap: 12,
  },
  menuItemWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemCopy: {
    flex: 1,
    gap: 2,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuItemDescription: {
    fontSize: 13,
  },
  metaWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "45%",
    justifyContent: "flex-end",
  },
  menuItemMeta: {
    fontSize: 14,
    fontWeight: "500",
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
