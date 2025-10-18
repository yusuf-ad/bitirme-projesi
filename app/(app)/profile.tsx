import { Colors } from "@/constants/theme";
import SignOutButton from "@/features/auth/components/sign-out-button";
import { useOnboarding } from "@/providers/onboarding-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

export default function ProfileTab() {
  const onboarding = useOnboarding();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      await onboarding.loadOnboardingData();

      // Get data from context after loading
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
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

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

  if (onboarding.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.lilac[900]} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>Your personalized settings</Text>
      </View>

      {/* Goals Section */}
      {profileData?.goals && profileData.goals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="target"
              size={20}
              color={Colors.lilac[900]}
            />
            <Text style={styles.sectionTitle}>Goals</Text>
          </View>
          <View style={styles.tagsContainer}>
            {profileData.goals.map((goal, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Body Metrics Section */}
      {(profileData?.age || profileData?.height || profileData?.weight) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="account"
              size={20}
              color={Colors.lilac[900]}
            />
            <Text style={styles.sectionTitle}>Body Metrics</Text>
          </View>
          <View style={styles.metricsGrid}>
            {profileData.gender && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Gender</Text>
                <Text style={styles.metricValue}>
                  {profileData.gender === "male"
                    ? "Male"
                    : profileData.gender === "female"
                    ? "Female"
                    : "Prefer not to say"}
                </Text>
              </View>
            )}
            {profileData.age && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Age</Text>
                <Text style={styles.metricValue}>{profileData.age} years</Text>
              </View>
            )}
            {profileData.height && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Height</Text>
                <Text style={styles.metricValue}>{profileData.height} cm</Text>
              </View>
            )}
            {profileData.weight && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Weight</Text>
                <Text style={styles.metricValue}>{profileData.weight} kg</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Meal Times Section */}
      {(profileData?.breakfastTime ||
        profileData?.lunchTime ||
        profileData?.dinnerTime) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color={Colors.lilac[900]}
            />
            <Text style={styles.sectionTitle}>Meal Times</Text>
          </View>
          <View style={styles.timeContainer}>
            {profileData.breakfastTime && (
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Breakfast</Text>
                <Text style={styles.timeValue}>
                  {profileData.breakfastTime}
                </Text>
              </View>
            )}
            {profileData.lunchTime && (
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Lunch</Text>
                <Text style={styles.timeValue}>{profileData.lunchTime}</Text>
              </View>
            )}
            {profileData.dinnerTime && (
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Dinner</Text>
                <Text style={styles.timeValue}>{profileData.dinnerTime}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Taste Preferences Section */}
      {(profileData?.meals.length ||
        profileData?.cuisines.length ||
        profileData?.cookingSkill) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="food"
              size={20}
              color={Colors.lilac[900]}
            />
            <Text style={styles.sectionTitle}>Taste Preferences</Text>
          </View>

          {profileData.cookingSkill && (
            <View style={styles.cookingSkillContainer}>
              <Text style={styles.cookingSkillLabel}>Cooking Skill</Text>
              <View style={styles.cookingSkillBadge}>
                <Text style={styles.cookingSkillEmoji}>
                  {getCookingSkillEmoji(profileData.cookingSkill)}
                </Text>
                <Text style={styles.cookingSkillText}>
                  {getCookingSkillLabel(profileData.cookingSkill)}
                </Text>
              </View>
            </View>
          )}

          {profileData.meals.length > 0 && (
            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Meal Types</Text>
              <View style={styles.tagsContainer}>
                {profileData.meals.map((meal, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{meal}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {profileData.cuisines.length > 0 && (
            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Cuisines</Text>
              <View style={styles.tagsContainer}>
                {profileData.cuisines.map((cuisine, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{cuisine}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {profileData.dietPreferences.length > 0 && (
            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Diet Preferences</Text>
              <View style={styles.tagsContainer}>
                {profileData.dietPreferences.map((diet, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{diet}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {profileData.allergies.length > 0 && (
            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Allergies & Dislikes</Text>
              <View style={styles.tagsContainer}>
                {profileData.allergies.map((allergy, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Sign Out Button */}
      <View style={styles.signOutContainer}>
        <SignOutButton />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.lilac[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.lilac[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: Colors.lilac[900],
    fontWeight: "500",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  metricItem: {
    flex: 1,
    minWidth: "45%",
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  timeContainer: {
    gap: 12,
  },
  timeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  timeLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  cookingSkillContainer: {
    marginBottom: 16,
  },
  cookingSkillLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  cookingSkillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lilac[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 8,
  },
  cookingSkillEmoji: {
    fontSize: 20,
  },
  cookingSkillText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.lilac[900],
  },
  preferenceGroup: {
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    fontWeight: "500",
  },
  signOutContainer: {
    marginTop: 24,
    alignItems: "center",
  },
});
