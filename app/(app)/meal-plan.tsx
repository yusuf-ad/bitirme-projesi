import { Colors } from "@/constants/theme";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MealPlanEmptyState } from "../../features/meal-plan";

export default function MealPlanTab() {
  const { bottom, top } = useSafeAreaInsets();
  // TODO: This will be set to true after meal plan is created
  const [hasMealPlan] = useState(false);

  function handleCreateMealPlan() {
    router.push("/(plan)/create");
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: bottom + (Platform.OS === "ios" ? 52 : 52 * 2),
          paddingTop: top,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Meal Plan</Text>
      </View>

      {/* Subtitle - only show when no meal plan */}
      {!hasMealPlan && (
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            Get balanced meal schedule for your goals and tastes.
          </Text>
        </View>
      )}

      {/* Content - Empty State or Meal Plan */}
      {!hasMealPlan ? (
        <MealPlanEmptyState onCreatePress={handleCreateMealPlan} />
      ) : (
        <View style={styles.mealPlanContent}>
          <Text style={styles.placeholderText}>
            Your meal plan will appear here
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: "center",
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 22,
    lineHeight: 28,
    color: "#120F1A",
    textAlign: "center",
  },
  subtitleContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    alignItems: "center",
  },
  subtitle: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 24,
    color: "#120F1A",
    textAlign: "center",
  },
  mealPlanContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  placeholderText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 24,
    color: "#737780",
    textAlign: "center",
  },
});
