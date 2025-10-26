import { Colors } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useOnboarding } from "@/providers/onboarding-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}

export default function ProfileTab() {
  const { profile, session, isLoading: authLoading } = useAuthContext();
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

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

  const loadProfileData = async () => {
    try {
      await onboarding.loadOnboardingData();
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

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

  const generalMenuItems: MenuItem[] = [
    {
      id: "account",
      title: "Account",
      icon: "account-circle-outline",
      onPress: () => router.push("/(app)/(profile)/account"),
    },
    {
      id: "preferences",
      title: "Preferences",
      icon: "tune",
      onPress: () => router.push("/(app)/(profile)/preferences"),
    },
    {
      id: "goals",
      title: "Goals & Metrics",
      icon: "target",
      onPress: () => router.push("/(app)/(profile)/goals-metrics"),
    },
    {
      id: "meal-times",
      title: "Meal Times",
      icon: "clock-outline",
      onPress: () => router.push("/(app)/(profile)/meal-times"),
    },
  ];

  const featureMenuItems: MenuItem[] = [
    {
      id: "taste",
      title: "Taste Preferences",
      icon: "food",
      onPress: () => router.push("/(app)/(profile)/taste-preferences"),
    },
    {
      id: "allergies",
      title: "Allergies & Diet",
      icon: "alert-circle-outline",
      onPress: () => router.push("/(app)/(profile)/allergies-diet"),
    },
    {
      id: "cooking",
      title: "Cooking Skill",
      icon: "chef-hat",
      onPress: () => router.push("/(app)/(profile)/cooking-skill"),
    },
  ];

  const formatTime = (time: {
    hour: number;
    minute: number;
    period: "AM" | "PM";
  }) => {
    return `${time.hour}:${time.minute.toString().padStart(2, "0")} ${
      time.period
    }`;
  };

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

  const renderMenuItem = (item: MenuItem, index: number, array: MenuItem[]) => (
    <View key={item.id}>
      <Pressable
        style={({ pressed }) => [
          styles.menuItem,
          pressed && styles.menuItemPressed,
        ]}
        onPress={item.onPress}
      >
        <View style={styles.menuItemLeft}>
          <View style={styles.menuIconContainer}>
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={Colors.lilac[900]}
            />
          </View>
          <Text style={styles.menuItemText}>{item.title}</Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={Colors.lilac[900]}
        />
      </Pressable>
      {index < array.length - 1 && <View style={styles.separator} />}
    </View>
  );

  if (onboarding.isLoading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.lilac[900]} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: top }]}
      contentContainerStyle={[styles.content, { paddingBottom: bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Page Title */}
      <Text style={styles.pageTitle}>More</Text>

      {/* User Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getUserInitials()}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{getUserDisplayName()}</Text>
          <Text style={styles.profileMemberSince}>
            Member Since {getMemberSinceDate()}
          </Text>
        </View>
      </View>

      {/* General Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.menuContainer}>
          {generalMenuItems.map((item, index, array) =>
            renderMenuItem(item, index, array)
          )}
        </View>
      </View>

      {/* Feature Settings Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Feature Settings</Text>
        <View style={styles.menuContainer}>
          {featureMenuItems.map((item, index, array) =>
            renderMenuItem(item, index, array)
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  content: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 24,
    marginTop: 8,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.text.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileMemberSince: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemPressed: {
    backgroundColor: "#F8F8F8",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: "400",
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 60,
  },
});
