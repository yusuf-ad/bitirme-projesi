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

export default function MealTimesScreen() {
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (time: {
    hour: number;
    minute: number;
    period: "AM" | "PM";
  }) => {
    return `${time.hour}:${time.minute.toString().padStart(2, "0")} ${
      time.period
    }`;
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
        <Text style={styles.headerTitle}>Meal Times</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 20 }]}
      >
        <View style={styles.section}>
          <Text style={styles.sectionDescription}>
            Your preferred meal times throughout the day
          </Text>

          <View style={styles.mealTimeCard}>
            <View style={styles.mealTimeIcon}>
              <MaterialCommunityIcons
                name="weather-sunset-up"
                size={24}
                color={Colors.lilac[900]}
              />
            </View>
            <View style={styles.mealTimeInfo}>
              <Text style={styles.mealTimeLabel}>Breakfast</Text>
              <Text style={styles.mealTimeValue}>
                {formatTime(onboarding.breakfastTime)}
              </Text>
            </View>
          </View>

          <View style={styles.mealTimeCard}>
            <View style={styles.mealTimeIcon}>
              <MaterialCommunityIcons
                name="white-balance-sunny"
                size={24}
                color={Colors.lilac[900]}
              />
            </View>
            <View style={styles.mealTimeInfo}>
              <Text style={styles.mealTimeLabel}>Lunch</Text>
              <Text style={styles.mealTimeValue}>
                {formatTime(onboarding.lunchTime)}
              </Text>
            </View>
          </View>

          <View style={styles.mealTimeCard}>
            <View style={styles.mealTimeIcon}>
              <MaterialCommunityIcons
                name="weather-night"
                size={24}
                color={Colors.lilac[900]}
              />
            </View>
            <View style={styles.mealTimeInfo}>
              <Text style={styles.mealTimeLabel}>Dinner</Text>
              <Text style={styles.mealTimeValue}>
                {formatTime(onboarding.dinnerTime)}
              </Text>
            </View>
          </View>
        </View>
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
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  mealTimeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
  },
  mealTimeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lilac[100],
    justifyContent: "center",
    alignItems: "center",
  },
  mealTimeInfo: {
    flex: 1,
  },
  mealTimeLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  mealTimeValue: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
});
